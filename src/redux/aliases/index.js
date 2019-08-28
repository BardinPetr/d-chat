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
} from 'Approot/misc/util';
import uuidv1 from 'uuid/v1';
import sleep from 'sleep-promise';

const BEGTOPIC = 'D-Chat Intro';
// TODO move to own file
const password = 'd-chat!!!';

const subscribeToChat = originalAction => dispatch => {
	const topic = originalAction.payload.topic;
	if ( topic != null && topic !== 'D-Chat Intro' ) {
		window.nknClient.subscribe( topic )
			.then(txId => {
				dispatch(subscribe(topic, txId));
				dispatch(getSubscribers(topic));
			},
			err => {
				console.log('Errored at subscribe. Already subscribed?', err);
			}
			);
	}
};

const joinChat = originalAction => (dispatch) => {
	const topic = originalAction.payload.topic;
	if ( !topic ) {
		return;
	}
	console.log('is anybody out there? Entering moonchat', topic);

	window.nknClient.subscribe( topic )
		.then(txId => {
			console.log('Subscription transaction:', txId);
			// There will be a bunch of work when "hide chat" is implemented.
			dispatch(subscribe(topic, txId));
			dispatch(getSubscribers(topic));
		},
		err => {
			// Insufficient funds.
			if ( err.data.includes('funds') ) {
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
			console.log('Errored at subscribe. Already subscribed?', err);
		});

	dispatch(createChat(topic));
	// return dispatch( enterChat(topic) );
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

			// New users beg for coins on '#D-Chat Intro'.
			// Try twice + sleep 10secs. Sometimes it sends out false positives.
			const balance = await nknClient.wallet.getBalance()
				.then(balance => balance.eq(0) ? sleep(10000).then(
					() => nknClient.wallet.getBalance()
				) : balance)
				.then(balance => balance);

			console.log('CONNECTED:BALANCE:', balance);
			if (balance.eq(0)) {
				new Message({
					contentType: 'text',
					content: 'Please, tip me. _This message was sent automatically._',
					topic: BEGTOPIC
				}).publish(BEGTOPIC);
			}
		});

		nknClient.on('message', (...args) => {
			console.log('Received message:', ...args);
			dispatch(receivingMessage(...args));
		});

		// Pending subscriptions handler.
		nknClient.on('block', block => {
			console.log('New block!!!', block);
			let subs = getState().subscriptions;
			for	( let topic of Object.keys(subs) ) {
				// Check that the sub is not yet resolved (not null), then try find it in the block.
				if ( block.transactions.find(tx => subs[topic] === tx.hash ) ) {
					console.log('Subscribe completed!');
					dispatch(subscribeCompleted(topic));
					// Doesn't update correctly without timeout.
					setTimeout(() => dispatch(getSubscribers(topic)), 500);
				}
			}
		});

		// Pending value transfers handler.
		nknClient.on('block', block => {
			const transactions = getState().transactions;
			const pendingTransactions = transactions.unconfirmed.map(i => i.transactionID);

			for ( let pendingTx of pendingTransactions ) {
				if ( block.transactions.find(tx => pendingTx === tx.hash ) ) {
					console.log('Transaction complete!');
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

		console.log('logged in');
		status = { addr: nknClient.addr };
	} catch (e) {
		console.log('Failed login.', e);
		status = { error: true };
	}
	return dispatch( setLoginStatus(status) );
};

// TODO remove topic from message.
const publishMessage = originalAction => () => {
	console.log('Publishing message', originalAction);

	const message = originalAction.payload.message;
	const topic = originalAction.payload.message.topic;

	new Message(message).publish(topic);

	return originalAction;
};

const sendPrivateMessage = originalAction => (dispatch) => {
	console.log('Sending private message', originalAction);

	const message = new Message(originalAction.payload.message);
	const recipient = originalAction.payload.recipient;

	message.send(recipient);

	// Override topic so it matches. Otherwise it would be receiving person's topic.
	message.topic = genPrivateChatName(recipient);
	message.from('me').receive(dispatch);

	return originalAction;
};

const getSubscribersHandler = originalAction => async (dispatch) => {
	console.log('Getting subs', originalAction);
	const topic = originalAction.payload.topic;
	let subscribers = await window.nknClient.getSubscribers(topic);
	subscribers = Object.keys(subscribers || {});

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

const newTransaction = originalAction => async () => {
	console.log('Sending NKN', originalAction);
	const { to, content, value, topic, targetID } = originalAction.payload;

	// Send
	const tx = await window.nknClient.wallet.transferTo(
		getAddressFromPubKey(to),
		value
	).then(tx => {
		const message = new Message({
			contentType: 'nkn/tip',
			value,
			content,
			topic, // ehh TODO rm.
			targetID,
		}).from('me');
		message.notify();
		message.publish(topic);

		console.log('NKN was sent. tx:', tx, 'creating message', message);

		// Generate new ID, then send privately.
		message.transactionID = tx;
		message.id = uuidv1();
		message.title = `${__('PRIVATE MESSAGE')}: ${message.title}`;
		message.send(to)
			.then(() => console.log('Successfully sent notice'),
				e => console.error('Error when sending notice', e));

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
	'PUBLISH_MESSAGE': publishMessage,
	'LOGIN': login,
	'JOIN_CHAT_ALIAS': joinChat,
	'chat/GET_SUBSCRIBERS_ALIAS': getSubscribersHandler,
	'chat/MARK_READ_ALIAS': markRead,
	'LOGOUT_ALIAS': logout,
	'GET_BALANCE_ALIAS': getBalance,
	'nkn/NEW_TRANSACTION_ALIAS': newTransaction,
	'SUBSCRIBE_TO_CHAT_ALIAS': subscribeToChat,
	'SEND_PRIVATE_MESSAGE_ALIAS': sendPrivateMessage,
};
