import React,	{	Component	}	from 'react';
import './App.css';
import passworder from 'browser-passworder';

import ChatList	from './ChatList';
import Chatroom	from './Chatroom';
import LoginBox	from './LoginBox';
import Header	from './Header';
// import { runtime } from 'webextension-polyfill';
// import sleep from 'sleep-promise';

import configs from '../../Configs';
import NKN from	'./nkn';
import { genChatID } from	'./util';

/**
 * TODO move all the wallet and nknClient stuff into background page, probably use one of the webext-redux things to handle the interaction. Then make sure never to leak the stuff from bg.
 * The advatanges are that messages can be received when popup is not open, the password/etc will stay there, and it's probably easier to manage the state that way, in the end.
 *
 * MetaMask uses an "unlocked" attribute that resets on every browser restart. Makes sense.
 */
class	App	extends	Component	{
	constructor() {
		super();

		const existingState = JSON.parse( localStorage.getItem('state') || '{}' );

		this.state = {
			username: existingState.username || null,
			addr: existingState.addr || null,
			activeChatTopic: existingState.activeChatTopic || null,
			/*
			chats	OBJECT:	{
				// chat	object
				// topicID is	a	hash of	the	topic.
				[topicID]: {
					messages:	[
						message: {
							// So	why	is topic in	message? Because receivers have	to see it	too. It	doesn't	get	transmitted	with publish.
							topic,
							username,
							timestamp,
							content,
							contentType: "text"	|| "subscribe",
						}
						// Chat	subscription tx	id.
						subscriptionTxID: null || txid
					],
				},
				[topicID]: {...}
			}
			*/
			chats: existingState.chats || {},
		};
		// With	this,	we get around	waiting	for	connections	to happen. Could call it actionQueue, too.
		this.messageQueue	=	existingState.messageQueue || [];

		/**
		 * Saves state of open chats. Does not save messageQueue.
		 * https://github.com/piroor/webextensions-lib-configs#important-note-around-object-or-array-values
		 *
		 * TODO use localStorage for saving state, then use the web-ext storage on browser shutdown only.
		 * Using runtime.onSuspend here is tricky? It will add a new listener every time if I just call .addListener here, but on the other hand it needs the this.state. Wait till background script to move on.
		 */
		window.addEventListener('beforeunload', async () => {
			await configs.$loaded;
			const chats = this.state.chats;
			configs.chats = JSON.parse( JSON.stringify( chats ) );
		});
	}

	/**
	 * @return A string to show on the login box if unsuccesful.
	 */
	login = async ({ username, password }) => {
		await configs.$loaded;

		if ( !username || !username.trim() ) {
			username = 'Pseudonymous';
		}

		console.log('Logging in.');
		// Workaround before bg script things. TODO remove on bg script.
		// How do I store a password client side? It'll be shoved into the bg script, at least.
		const secretPassword = 'whatamIsupposedtoDOh3r3?';
		if ( password != null ) {
			const blob = await passworder.encrypt(secretPassword, password);
			localStorage.setItem( 'password', blob );

		} else {
			const blob = localStorage.getItem( 'password' );
			password = await passworder.decrypt(secretPassword, blob);
		}

		let nknClient;

		const walletJSON = configs.walletJSON;
		try {
			nknClient = new NKN({username, password, walletJSON});
		} catch(msg) {
			return msg;
		}

		/**
		 * Acts on queued actions on connect. TODO loading spinner might be nice.
		 */
		nknClient.on('connect', () => {
			console.log( 'connected' );
			this.nknClient = nknClient;
			this.messageQueue.forEach( this.sendMessage	);
			// TODO	handle errored messages	before cleaning	this.
			this.messageQueue	=	[];
		});

		/**
		 * Receives messages and sends them to this.receiveMessage to be drawn on UI.
		 */
		nknClient.on('message', (src, payload, payloadType) => {
			console.log('Received a message through NKN!', src, 'payload', payload, 'type', payloadType);
			if ( payloadType === 1 /*	nknClient.PayloadType.TEXT */	)	{
				const message = JSON.parse(payload);
				message.addr = src;
				this.receiveMessage(message);
				// Remove spinner here too, just in case popup was closed when the block went by, so it doesn't spin forever.
				this.subscribingTo(null, genChatID(message.topic));
			}	else {
				console.warn('Received data that was not TEXT', src, payload, payloadType);
			}
		});

		/**
		 * Removes loading spinner once subscription transaction is found in block.
		 */
		nknClient.on('block', block => {
			console.log('New block!!!',	block);

			let	topicID	= null;
			for	( let key in this.state.chats )	{
				// Check that the sub is not yet resolved (not null), then try find it in the block.
				if ( this.state.chats[key].subscriptionTxID !== null && block.transactions.find(tx	=> this.state.chats[key].subscriptionTxID === tx.hash )) {
					topicID	= key;
					break;
				}
			}
			// If it was found, then it is resolved. Replace txid with null.
			if (topicID)	{
				this.subscribingTo(null, topicID);
			}
		});

		var newState = JSON.parse(localStorage.getItem('state'));

		if (!newState) {
			newState = {
				username,
				addr: nknClient.addr,
				chats: JSON.parse(JSON.stringify(configs.chats))
			};
		}

		this.setState(newState);

	}

	/**
	 * Stuff to remove once background script is implemented.
	 *
	 * How bad is this for performance? Probably a terrible idea.
	 * Need this to preserve state between popup opens.
	 *
	 * TODO move chat states into background page.
	 */
	componentDidUpdate() {
		localStorage.setItem( 'state', JSON.stringify(this.state) );
	}
	componentDidMount() {
		if (this.state.username != null) {
			this.login({});
		}
		const existingState = JSON.parse( localStorage.getItem('state') || '{}' );
		if ( existingState.username != null ) {
			this.setState(existingState);
		}
	}


	/**
	 * Shows and hides the loading spinner.
	 *
	 * @param string|null txID The subscription	transaction	ID, or null to hide.
	 * @param string topicID hashed	topic.
	 */
	subscribingTo	=	async	(txID, topicID)	=> {
		const chats = Object.assign(
			{},
			this.state.chats,
			{
				[topicID]: Object.assign(
					{},
					this.state.chats[topicID],
					{
						subscriptionTxID: txID
					}
				)
			}
		);
		this.setState({
			chats
		});
	}

	/**
	 * Draws chat	bubbles	to UI.
	 */
	receiveMessage = async (message) =>	{
		const topic = message.topic;
		const topicID = genChatID(topic);
		const chat = this.state.chats[topicID];
		console.log('Receiving message:', message, chat);

		// Mark our own messages.
		if (message.addr === this.state.addr) {
			message.isMe = true;
		}

		let messageList = chat.messages || [];

		messageList	=	messageList.concat(message);
		this.setState({
			chats: Object.assign(
				{},
				this.state.chats,
				{ [topicID]: Object.assign({}, chat, { messages: messageList }) }
			),
		});
	}

	/**
	 * Sends messages	and	keeps	a	queue	of actions.
	 */
	sendMessage	=	(message)	=> {
		console.log('Sending message:', message);
		if (this.nknClient && message.topic) {
			const	topicID	=	genChatID(message.topic);

			if ( message.contentType === 'subscribe' ) {
				console.log('Subscribing...');

				this.nknClient.subscribe( topicID )
					.then(txID =>	this.subscribingTo(txID, topicID))
					// TODO
					.catch(err =>	console.warn('Most likely already subscribed. Subscribe	threw:', err));

			}	else {

				console.log('Publishing to:', message.topic, 'the message', message );
				this.nknClient.publishMessage( topicID, message );
			}
		} else {
			// Once	'connect'	event	happens, messages	in this	queue	will be	handled.
			this.messageQueue	=	this.messageQueue	|| [];
			this.messageQueue.push(message);
		}
	}

	createChatroom = async (topic) =>	{
		console.log('Created chatroom:', topic);
		const topicID = genChatID(topic);

		this.setState({
			// Not sure what's going on here.
			chats: Object.assign({}, this.state.chats, { [topicID]:	{	topic	}	}),
		});
	}

	/**
	 * Creates self-sent message to	UI.
	 */
	createMessage	=	(topic,	chat,	content, contentType)	=> {
		console.log('createMessage', {chat, topic, content, contentType, state: this.state});
		let message = {
			username:	this.state.username,
			content: content,
			contentType: contentType,
			timestamp: new Date().toUTCString(),
			topic,
			addr:	this.state.addr
		};

		this.sendMessage(message);
	}

	enterChatroom	=	(topic)	=> {
		console.log('Entering chatroom:', topic);
		if ( topic != null ) {
			// Use sendMessage to queue	this action.
			this.sendMessage({ contentType:'subscribe',	topic	});
		}
		this.setState({
			activeChatTopic: topic,
		});
	}

	popout = () => {
		browser.windows.create({
			url: browser.runtime.getURL('popup.html'),
			type: 'panel',
			height: 600,
			width: 450,
		});
	}

	render() {
		let topic = this.state.activeChatTopic;
		let chat = this.state.chats[genChatID(topic)];

		return (
			<div className="app">
				<div className="app-container">
					<div className={ this.state.username ? (topic	== null	?	'chatlist-container' : 'chatroom') : ''}>
						{ this.state.username &&
						<Header
							topic={topic}
							enterChatroom={this.enterChatroom}
							createChatroom={this.createChatroom}
							subscribing={chat ?	chat.subscriptionTxID :	null}
							popout={this.popout}
						/>
						}
						{
							this.state.username	?
								(
									topic	?
										<Chatroom
											chat={chat}
											createMessage={this.createMessage.bind(this, topic,	chat)}
										/>
										:
										<ChatList
											chats={this.state.chats}
											enterChatroom={this.enterChatroom}
										/>
								)
								:
								<LoginBox login={this.login}/>
						}
					</div>
				</div>
			</div>
		);
	}
}

export default App;
