import NKN from 'Approot/background/nknHandler';
import Message from 'Approot/background/Message';
import {
	transactionComplete,
	getSubscribers,
	getUnreadMessages,
	connected,
	createChat,
	receivingMessage,
	subscribe,
	setLoginStatus,
	setSubscribers,
	getBalance,
} from '../actions';
import { switchToClient, createNewClient } from '../actions/client';
import passworder from 'browser-passworder';
import {
	genPrivateChatName,
	__,
	getAddressFromAddr,
	setBadgeText,
	log,
	getChatDisplayName,
} from 'Approot/misc/util';

// TODO move to own file
const password = 'd-chat!!!';

const subscribeToChat = originalAction => (dispatch) => {
	const topic = originalAction.payload.topic;
	if ( topic != null && topic !== 'D-Chat Intro' && !topic.startsWith('/whisper/') ) {
		NKN.instance.subscribe( topic )
			.then(txId => {
				dispatch(subscribe(topic, txId));
				dispatch(getSubscribers(topic));
				new Message({
					topic,
					contentType: 'dchat/subscribe',
					content: __('Subscribed to') + ' ' + getChatDisplayName(topic) + '.',
					isPrivate: true,
				}).receive(dispatch);

			},
			err => {
				log('Errored at subscribe. Already subscribed?', err);
			}
			);
	}
};

// Hack to keep track of sent beg messages, to avoid spamming.
let beggedTopics = {};
const joinChat = originalAction => (dispatch) => {
	const topic = originalAction.payload.topic;
	if ( !topic ) {
		return;
	}
	log('is anybody out there? Entering moonchat', topic);

	NKN.instance.subscribe( topic )
		.then(txId => {
			log('Subscription transaction:', txId);
			// There will be a bunch of work when "hide chat" is implemented.
			dispatch(subscribe(topic, txId));
			dispatch(getSubscribers(topic));
			new Message({
				topic,
				contentType: 'dchat/subscribe',
				content: __('Re/subscribed to') + ' ' + getChatDisplayName(topic) + '.',
				isPrivate: true,
			}).receive(dispatch);
		},
		err => {
			// Insufficient funds.
			if ( err.data?.includes('funds') ) {
				if ( !beggedTopics[topic] ) {
					const noticeMsg = new Message({
						topic,
						contentType: 'dchat/subscribe',
						content: __('Tried to subscribe, but had no coins. Someone, please, tip to subscribe them.') + '\n\n_' + __('Automated message.') + '_',
					});
					noticeMsg.publish(topic);

					beggedTopics[topic] = 'tried';
					noticeMsg.content = __('You have no coins to subscribe. Sent out a request.');
					noticeMsg.receive(dispatch);
				}
			}
			log('Errored at subscribe. Already subscribed?', err);
		});

	dispatch(createChat(topic));
};

const addNKNListeners = async (dispatch, getState) => {
	const client = NKN.instance;

	client.on('connect', async () => {
		dispatch(connected());
		dispatch(getBalance());
		log('connected');
	});

	client.on('message', (...args) => {
		log('Received message:', ...args);
		dispatch(receivingMessage(...args));
	});

	// Pending value transfers handler.
	client.on('block', async block => {
		dispatch(getBalance());

		const transactions = getState().transactions;
		const pendingTransactions = transactions.unconfirmed.map(i => i.transactionID);
		log('New block!!!', block, transactions);

		for ( let pendingTx of pendingTransactions ) {
			if ( block.transactions.find(tx => pendingTx === tx.hash ) ) {
				log('Transaction complete!');
				dispatch(transactionComplete(pendingTx));
			}
		}
	});
};

/**
 * Logs in and adds nkn listeners. Dispatches chat updates like "new message".
 */
const login = originalAction => async (dispatch, getState) => {
	log('Attempting login', originalAction);
	const credentials = originalAction.payload.credentials;
	const rememberMe = credentials && credentials.rememberMe;

	let status;
	try {
		const nknClient = await NKN.start(credentials);
		log('starting..', nknClient);
		// nknClient.close();

		if (getState().clients.every(client => client.wallet.Address !== nknClient.wallet.address)) {
			const c = NKN.parseClient((nknClient));
			await dispatch(createNewClient(c));
		}

		dispatch(switchToClient(nknClient.wallet.address, credentials.username, credentials.password));

		if ( rememberMe ) {
			passworder.encrypt(password, credentials)
				.then(blob =>
					localStorage.setItem('credentials', JSON.stringify(blob))
				);
		}

		log('logged in');
		status = { addr: nknClient.addr };
	} catch (e) {
		log('Failed login.', e);
		status = { error: true };
	}
	return dispatch( setLoginStatus(status) );
};

// TODO replace topic with topicHash in message.
const publishMessage = originalAction => () => {
	log('Publishing message', originalAction);

	const message = originalAction.payload.message;
	const topic = originalAction.payload.message.topic;

	new Message(message).publish(topic);

	return originalAction;
};

const sendPrivateMessage = originalAction => async (dispatch) => {

	const message = new Message(originalAction.payload.message);
	const recipient = originalAction.payload.recipient;
	log('Sending private message', originalAction);

	message.whisper(recipient);

	message.topic = genPrivateChatName(recipient);
	message.from('me').receive(dispatch);

	return originalAction;
};

const getSubscribersHandler = originalAction => async (dispatch) => {
	log('Getting subs', originalAction);
	const topic = originalAction.payload.topic;
	let { subscribers, subscribersInTxPool } = await NKN.instance.getSubs(topic);
	subscribers = subscribers.concat(subscribersInTxPool);

	dispatch(setSubscribers(topic, subscribers));

	originalAction.payload = subscribers;
	return originalAction;
};

const markRead = originalAction => async (dispatch, getState) => {
	const ids = originalAction.payload.ids.length;
	if (ids > 0) {
		getUnreadMessages(getState()).then(count => setBadgeText( count - ids ));
	}

	return dispatch({
		type: 'chat/MARK_READ',
		payload: originalAction.payload,
	});
};

const logout = () => {
	NKN.clear();
	localStorage.clear();
	return {
		type: 'LOGOUT'
	};
};

const getTheBalance = () => async (dispatch) => {
	const client = NKN.instance;
	if (!client) {
		return;
	}

	const balance = await client.wallet.getBalance();

	log('Balance:', balance);
	return dispatch({
		type: 'nkn/GET_BALANCE',
		payload: {
			balance: balance.toFixed(8),
			address: client.wallet.address,
		}
	});
};

/**
 * Sends funds.
 */
const newTransaction = originalAction => async (dispatch) => {
	log('Sending NKN', originalAction);
	const { to, content, value, topic, targetID } = originalAction.payload;
	const isWhisper = topic.startsWith('/whisper/');

	// Send
	const tx = await NKN.instance.wallet.transferTo(
		getAddressFromAddr(to),
		value
	).then(async (tx) => {
		const message = new Message({
			contentType: 'nkn/tip',
			value,
			content,
			topic,
			targetID,
		});

		log('NKN was sent to', getAddressFromAddr(to), 'aka', to, '. tx:', tx, 'creating message', message);
		if (isWhisper) {
			// Simply receive it as a reaction.
			message.contentType = 'reaction';
			message.receive(dispatch);
			message.topic = undefined;
		} else {
			// Receive it by publishing it.
			message.publish(topic);
		}

		message.transactionID = tx;
		message.send(to);

		return { tx };
	}, e => {
		console.error('Error when sending tx', e);
		return { error: e.msg || e.data };
	});

	originalAction.payload = {
		transactionID: tx.tx,
		error: tx.error,
	};

	return originalAction;
};

const newClientHandler = originalAction => dispatch => {
	const { username } = originalAction.payload;

	try {
		const client = NKN.createClient(username);
		log('Created client:', client);
		dispatch(createNewClient(client));
		dispatch(switchToClient(client.wallet.Address));
	} catch (e) {
		originalAction.payload.error = __('Wrong password.');
	}
	return originalAction;
};

const switchToClientHandler = originalAction => (dispatch, getState) => {
	const { address } = originalAction.payload;

	log('Switching to client:', address);
	try {
		const client = NKN.activateClient(address);
		addNKNListeners(dispatch, getState);
		log('Switching to client:', client);

		dispatch({
			type: 'nkn/SWITCH_TO_CLIENT',
			payload: {
				client
			},
		});
	} catch(e) {
		originalAction.payload.error = __('Wrong password.');
	}
	return originalAction;
};

// Import and activate.
const walletImport = originalAction => (dispatch, getState) => {
	const existingWallets = getState().clients.map(c => c.wallet.Address);
	const { walletJSON, username, password } = originalAction.payload;
	if (existingWallets.includes(walletJSON.Address)) {
		originalAction.payload.error = __('This wallet is already imported.');
		return originalAction;
	}

	try {
		log('About to import:', walletJSON, password, username);
		const client = NKN.importClient(JSON.stringify(walletJSON), password, username);
		dispatch(createNewClient(client));
		dispatch(switchToClient(client.wallet.Address, username, password));
	} catch (e) {
		originalAction.payload.error = __('Wrong password.');
	}
	return originalAction;
};

export default {
	'PUBLISH_MESSAGE_ALIAS': publishMessage,
	'LOGIN_ALIAS': login,
	'JOIN_CHAT_ALIAS': joinChat,
	'chat/GET_SUBSCRIBERS_ALIAS': getSubscribersHandler,
	'chat/MARK_READ_ALIAS': markRead,
	'LOGOUT_ALIAS': logout,
	'GET_BALANCE_ALIAS': getTheBalance,
	'nkn/NEW_TRANSACTION_ALIAS': newTransaction,
	'SUBSCRIBE_TO_CHAT_ALIAS': subscribeToChat,
	'SEND_PRIVATE_MESSAGE_ALIAS': sendPrivateMessage,
	'nkn/NEW_CLIENT_ALIAS': newClientHandler,
	'nkn/SWITCH_TO_CLIENT_ALIAS': switchToClientHandler,
	'nkn/IMPORT_WALLET_ALIAS': walletImport,
};
