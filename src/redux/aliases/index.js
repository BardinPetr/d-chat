import NKN from '../../misc/nkn';
import { getUnreadMessages, setSubscribers, connected, createChat, enterChat, receivingMessage, subscribe, setLoginStatus, subscribeCompleted } from '../actions';
import passworder from 'browser-passworder';
import { setBadgeText } from 'Approot/misc/util';

// TODO move to own file
const password = 'd-chat!!!';

const joinChat = originalAction => (dispatch, getState) => {
	const topic = originalAction.payload.topic;
	console.log('is anybody out there? Entering moonchat', topic, getState());
	if ( topic != null ) {
		window.nknClient.subscribe( topic )
			.then(txId => {
				console.log('Subscription transaction:', txId);
				// There will be a bunch of work when "hide chat" is implemented.
				dispatch(createChat(topic));
				dispatch(subscribe(topic, txId));
			},
			err => {
				console.log('Errored at subscribe. Already subscribed?', err);
				// Would do this, but it's not consistent. The error messages don't reflect reality.
				// if ( err.data && err.data.includes('already subscribed') ) {
				// dispatch(subscribeCompleted(topic));
			}
			);
	}
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

		nknClient.on('connect', () => {
			console.log( 'connected' );
			dispatch(connected());
		});

		nknClient.on('message', (...args) => {
			console.log('Received message:', ...args);
			dispatch(receivingMessage(...args));
		});

		nknClient.on('block', block => {
			console.log('New block!!!', block);
			let subs = getState().subscriptions;
			for	( let topic of Object.keys(subs) ) {
				// Check that the sub is not yet resolved (not null), then try find it in the block.
				if ( block.transactions.find(tx => subs[topic] === tx.hash ) ) {
					console.log('Subscribe completed!');
					dispatch(subscribeCompleted(topic));
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

const publishMessage = originalAction => () => {
	console.log('Publishing message', originalAction);
	const message = originalAction.payload.message;
	const topic = originalAction.payload.message.topic;
	message.timestamp = new Date().toUTCString();
	window.nknClient.publishMessage(topic, message);
	return originalAction;
};

const getSubscribers = originalAction => async dispatch => {
	const topic = originalAction.payload.topic;
	const subscribers = await window.nknClient.getSubscribers(topic);
	return dispatch(setSubscribers(topic, Object.keys(subscribers)));
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
	window.nknClient.close();
	window.nknClient = null;
	localStorage.clear();
	return {
		type: 'LOGOUT'
	};
};

const getBalance = () => async (dispatch) => {
	const balance = await window.nknClient.wallet.getBalance();
	return dispatch({
		type: 'nkn/GET_BALANCE',
		payload: {
			balance: balance.toString(),
		}
	});
};

export default {
	'PUBLISH_MESSAGE': publishMessage,
	'LOGIN': login,
	'JOIN_CHAT': joinChat,
	'GET_SUBSCRIBERS': getSubscribers,
	'chat/MARK_READ_ALIAS': markRead,
	'LOGOUT_ALIAS': logout,
	'GET_BALANCE_ALIAS': getBalance,
};
