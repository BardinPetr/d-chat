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
	setSubscribers,
	getBalance,
} from '../actions';
import passworder from 'browser-passworder';
import {
	genPrivateChatName,
	__,
	getAddressFromPubKey,
	setBadgeText,
	log,
} from 'Approot/misc/util';

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

const joinChat = originalAction => (dispatch, getState) => {
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
				if ( !getState().subscriptions[topic] ) {
					const noticeMsg = new Message({
						topic,
						contentType: 'dchat/subscribe',
						content: __('Tried to subscribe, but had no coins. Someone, please, tip to subscribe them.') + '\n\n_' + __('Automated message.') + '_',
					});
					noticeMsg.publish(topic);

					dispatch(subscribe(topic, 'attempt'));
					noticeMsg.content = __('You have no coins to subscribe. Sent out a request.');
					noticeMsg.receive(dispatch);
				}
			}
			log('Errored at subscribe. Already subscribed?', err);
		});

	dispatch(createChat(topic));
};

/**
 * Logs in and adds nkn listeners. Dispatches chat updates like "new message".
 */
const login = originalAction => (dispatch, getState) => {
	log('Attempting login', originalAction);
	const credentials = originalAction.payload.credentials;
	const rememberMe = credentials && credentials.rememberMe;

	let status;
	try {
		const nknClient = new NKN(credentials);

		nknClient.on('connect', async () => {
			dispatch(connected());
			dispatch(getBalance());
			log('connected');
		});

		nknClient.on('message', (...args) => {
			log('Received message:', ...args);
			dispatch(receivingMessage(...args));
		});

		// Pending value transfers handler.
		nknClient.on('block', block => {
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

	message.whisper(recipient);

	message.topic = genPrivateChatName(recipient);
	message.from('me').receive(dispatch);

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

	return dispatch({
		type: 'chat/MARK_READ',
		payload: originalAction.payload,
	});
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

const getTheBalance = () => async (dispatch) => {
	if (!window.nknClient) {
		return;
	}

	const balance = await window.nknClient.wallet.getBalance();
	log('Balance:', balance);
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
	'GET_BALANCE_ALIAS': getTheBalance,
	'nkn/NEW_TRANSACTION_ALIAS': newTransaction,
	'SUBSCRIBE_TO_CHAT_ALIAS': subscribeToChat,
	'SEND_PRIVATE_MESSAGE_ALIAS': sendPrivateMessage,
};
