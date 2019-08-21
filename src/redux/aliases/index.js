import NKN from '../../misc/nkn';
import {
	createTransaction,
	transactionComplete,
	getSubscribers,
	getUnreadMessages,
	connected,
	createChat,
	enterChat,
	receivingMessage,
	subscribe,
	setLoginStatus,
	subscribeCompleted,
} from '../actions';
import passworder from 'browser-passworder';
import { __, getAddressFromPubKey, setBadgeText } from 'Approot/misc/util';
import uuidv1 from 'uuid/v1';
import { actions as toastr } from 'react-redux-toastr';

// TODO move to own file
const password = 'd-chat!!!';

const prepareNewMessage = msg => {
	const newMsg = {
		id: uuidv1(),
		timestamp: new Date().toUTCString(),
		...msg,
	};
	return newMsg;
};


const subscribeToChat = originalAction => dispatch => {
	const topic = originalAction.payload.topic;
	if ( topic != null && topic !== 'D-Chat Intro' ) {
		window.nknClient.subscribe( topic )
			.then(txId => {
				dispatch(subscribe(topic, txId));
				dispatch(toastr.add({
					type: 'info',
					title: __('Subscribing...'),
				}));
			},
			err => {
				console.log('Errored at subscribe. Already subscribed?', err);
			}
			);
	}
};

const joinChat = originalAction => (dispatch, getState) => {
	const topic = originalAction.payload.topic;
	console.log('is anybody out there? Entering moonchat', topic, getState());
	if ( topic != null ) {
		window.nknClient.subscribe( topic )
			.then(txId => {
				console.log('Subscription transaction:', txId);
				// There will be a bunch of work when "hide chat" is implemented.
				dispatch(subscribe(topic, txId));
				dispatch(toastr.add({
					type: 'info',
					title: __('Subscribing...'),
				}));
			},
			err => {
				// Insufficient funds.
				if ( err.data.includes('funds') ) {
					dispatch(toastr.add({
						type: 'error',
						title: __('Insufficient Funds'),
						message: __('You need NKN coins for subscribing. You will not receive messages.'),
					}));
				}
				console.log('Errored at subscribe. Already subscribed?', err);
			}
			);
	}
	dispatch(createChat(topic));
	return dispatch( enterChat(topic) );
};

/**
 * Logs in and adds nkn listeners. Dispatches chat updates like "new message".
 *
 * XXX how about moving the listeners into NKN file? And making singleton pattern?
 */
const login = originalAction => (dispatch, getState) => {
	const credentials = originalAction.payload.credentials;
	const rememberMe = credentials && credentials.rememberMe;

	let status;
	try {
		const nknClient = new NKN(credentials);

		nknClient.on('connect', async () => {
			console.log( 'connected' );
			dispatch(connected());

			// New users beg for coins on '#D-Chat Intro'.
			const balance = await nknClient.wallet.getBalance();
			if (balance.eq(0)) {
				const begTopic = 'D-Chat Intro';
				nknClient.publishMessage(begTopic, prepareNewMessage({
					contentType: 'text',
					content: 'I am dirt poor, please tip me. __This message was sent automatically.__',
					topic: begTopic
				}));
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

			console.log('Transactions:', transactions);
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

	window.nknClient.publishMessage(topic, message);

	return originalAction;
};

const getSubscribersHandler = originalAction => async () => {
	console.log('Getting subs', originalAction);
	const topic = originalAction.payload.topic;
	const subscribers = await window.nknClient.getSubscribers(topic);
	originalAction.payload = Object.keys(subscribers);
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

const newTransaction = originalAction => async (dispatch) => {
	console.log('Sending NKN', originalAction);
	const { to, value, topic } = originalAction.payload;

	// Send
	const tx = await window.nknClient.wallet.transferTo(
		getAddressFromPubKey(to),
		value
	).then(tx => {
		const message = prepareNewMessage({
			contentType: 'nkn/tip',
			transactionID: tx,
			value,
			to,
			topic, // ehh TODO rm.
		});

		console.log('NKN was sent. tx:', tx, 'creating message', message);

		// Add to list of outgoing transactions.
		dispatch(createTransaction(tx, {
			...message,
			outgoing: true,
		}));

		// Send notice to recipient.
		message.isPrivate = true;
		window.nknClient.sendMessage(
			to,
			message
		).then(() => console.log('Successfully sent notice'),
			e => console.error('Error when sending notice', e));

		// Return tx id for UI.
		return tx;

	}, e => console.error('Error when sending tx', e));

	originalAction.payload = {
		transactionID: tx,
	};
	return originalAction;
};

export default {
	'PUBLISH_MESSAGE': publishMessage,
	'LOGIN': login,
	'JOIN_CHAT': joinChat,
	'GET_SUBSCRIBERS': getSubscribersHandler,
	'chat/MARK_READ_ALIAS': markRead,
	'LOGOUT_ALIAS': logout,
	'GET_BALANCE_ALIAS': getBalance,
	'nkn/NEW_TRANSACTION_ALIAS': newTransaction,
	'SUBSCRIBE_TO_CHAT_ALIAS': subscribeToChat,
};
