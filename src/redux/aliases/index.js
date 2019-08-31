import NKN from '../../misc/nkn';
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
	subscribeCompleted,
	setSubscribers,
} from '../actions';
import passworder from 'browser-passworder';
import {
	genPrivateChatName,
	__,
	getAddressFromPubKey,
	setBadgeText,
	log,
} from 'Approot/misc/util';
import sleep from 'sleep-promise';

const BEGTOPIC = 'D-Chat Intro';
// TODO move to own file
const password = 'd-chat!!!';

const subscribeToChat = originalAction => (dispatch) => {
	const topic = originalAction.payload.topic;
	if ( topic != null && topic !== 'D-Chat Intro' && !topic.startsWith('/whisper/') ) {
		window.nknClient.subscribe( topic )
			.then(txId => {
				dispatch(subscribe(topic, txId));
				dispatch(getSubscribers(topic));
			},
			err => {
				log('Errored at subscribe. Already subscribed?', err);
			}
			);
	}
};

const joinChat = originalAction => (dispatch) => {
	const topic = originalAction.payload.topic;
	if ( !topic ) {
		return;
	}
	log('is anybody out there? Entering moonchat', topic);

	window.nknClient.subscribe( topic )
		.then(txId => {
			log('Subscription transaction:', txId);
			// There will be a bunch of work when "hide chat" is implemented.
			dispatch(subscribe(topic, txId));
			dispatch(getSubscribers(topic));
		},
		err => {
			// Insufficient funds.
			if ( err.data?.includes('funds') ) {
				new Message({
					topic,
					error: true,
					content: __('Insufficient Funds. You need NKN coins for subscribing. You will not receive messages, but you can send them. If you send a message, someone listening might tip you NKN coins so you can subscribe. Or you can use the faucet on the home page.') + '\n\n' + __('After you receive coins, you may have to reload this page.'),
					contentType: 'dchat/subscribe',
				}).receive(dispatch);

				// TODO create contentType 'dchat/text'.
				new Message({
					topic,
					contentType: 'text',
					content: __('Tried to subscribe, but had no coins. React with an emoji to subscribe them.') + '\n\n_' + __('Automated message.') + '_',
				}).publish(topic);
			}
			log('Errored at subscribe. Already subscribed?', err);
		});

	return dispatch(createChat(topic));
};

/**
 * Logs in and adds nkn listeners. Dispatches chat updates like "new message".
 */
const login = originalAction => (dispatch, getState) => {
	const credentials = originalAction.payload.credentials;
	const rememberMe = credentials && credentials.rememberMe;

	let status;
	try {
		const nknClient = new NKN(credentials);

		nknClient.on('connect', async () => {
			dispatch(connected());
			log('connected');

			// New users beg for coins on '#D-Chat Intro'.
			// Try twice + sleep 10secs, because sometimes it false positives.
			const balance = await sleep(100).then(() => nknClient.wallet.getBalance())
				.then(balance => balance.eq(0) ? (
					sleep(10000).then(
						() => nknClient.wallet.getBalance()
					)) : balance)
				.then(balance => balance);

			// Seems to wait 10 secs EVERY TIME?
			log('CONNECTED:BALANCE:', balance);
			if (balance.eq(0)) {
				new Message({
					contentType: 'text',
					content: 'Please, tip me. _This message was sent automatically._',
					topic: BEGTOPIC
				}).publish(BEGTOPIC);
			}
		});

		nknClient.on('message', (...args) => {
			log('Received message:', ...args);
			dispatch(receivingMessage(...args));
		});

		// Pending subscriptions handler.
		nknClient.on('block', block => {
			let subs = getState().subscriptions;
			log('New block!!!', block, '.subscriptions:', subs);
			for ( let topic of Object.keys(subs) ) {
				// Check that the sub is not yet resolved (not null), then try find it in the block.
				if ( block.transactions.find(tx => subs[topic] === tx.hash ) ) {
					log('Subscribe completed!');
					dispatch(subscribeCompleted(topic, {
						blockheight: block.header.height,
					}));
					// Doesn't update correctly without timeout.
					setTimeout(() => dispatch(getSubscribers(topic)), 500);
				}
			}
		});

		// Pending value transfers handler.
		nknClient.on('block', block => {
			window.latestBlockHeight = block.header.height;
			const transactions = getState().transactions;
			const pendingTransactions = transactions.unconfirmed.map(i => i.transactionID);
			log(transactions);

			for ( let pendingTx of pendingTransactions ) {
				if ( block.transactions.find(tx => pendingTx === tx.hash ) ) {
					log('Transaction complete!');
					dispatch(transactionComplete(pendingTx));
				}
			}
		});

		// Can't be cloned but we want to keep this.
		window.nknClient = nknClient;

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

	await message.whisper(recipient);

	message.topic = genPrivateChatName(recipient);
	await message.from('me').receive(dispatch);

	return originalAction;
};

const getSubscribersHandler = originalAction => async (dispatch) => {
	log('Getting subs', originalAction);
	const topic = originalAction.payload.topic;
	let { subscribers, subscribersInTxPool } = await window.nknClient.getSubs(topic);
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

	if (originalAction.payload.options.private) {
		return dispatch({
			type: 'chat/MARK_READ_PRIVATE',
			payload: originalAction.payload,
		});
	} else {
		return dispatch({
			type: 'chat/MARK_READ',
			payload: originalAction.payload,
		});
	}
};

const logout = () => {
	if (window.nknClient) {
		window.nknClient.close();
		window.nknClient = null;
	}
	localStorage.clear();
	return {
		type: 'LOGOUT'
	};
};

const getBalance = () => async (dispatch) => {
	if (!window.nknClient) {
		return;
	}

	const balance = await window.nknClient.wallet.getBalance();
	return dispatch({
		type: 'nkn/GET_BALANCE',
		payload: {
			balance: balance.toFixed(8),
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
	const tx = await window.nknClient.wallet.transferTo(
		getAddressFromPubKey(to),
		value
	).then(async (tx) => {
		const message = new Message({
			contentType: 'nkn/tip',
			value,
			content,
			topic,
			targetID,
		});

		log('NKN was sent. tx:', tx, 'creating message', message);
		if (isWhisper) {
			// Simply receive it as a reaction.
			message.contentType = 'reaction';
			message.receive(dispatch);
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

export default {
	'PUBLISH_MESSAGE_ALIAS': publishMessage,
	'LOGIN_ALIAS': login,
	'JOIN_CHAT_ALIAS': joinChat,
	'chat/GET_SUBSCRIBERS_ALIAS': getSubscribersHandler,
	'chat/MARK_READ_ALIAS': markRead,
	'LOGOUT_ALIAS': logout,
	'GET_BALANCE_ALIAS': getBalance,
	'nkn/NEW_TRANSACTION_ALIAS': newTransaction,
	'SUBSCRIBE_TO_CHAT_ALIAS': subscribeToChat,
	'SEND_PRIVATE_MESSAGE_ALIAS': sendPrivateMessage,
};
