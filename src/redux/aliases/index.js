import NKN from '../../misc/nkn';
import { createChat, enterChat, receiveMessage, subscribe, setLoginStatus, subscribeCompleted } from '../actions';

const joinChat = originalAction => (dispatch, getState) => {
	const topic = originalAction.payload.topic;
	console.log('is anybody out there? Entering moonchat', topic, getState());
	if ( topic != null ) {
		window.nknClient.subscribe( topic )
			.then(txId => {
				// There will be a bunch of work when "hide chat" is implemented.
				dispatch(createChat(topic));
				dispatch(subscribe(topic, txId));
			},
			() => dispatch(subscribeCompleted(topic))
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
	let credentials = originalAction.payload.credentials;
	console.log('is anybody out there? this is moon base.', originalAction, credentials, dispatch, getState);
	// if ( !credentials ) {
	// 	return Promise.reject();
	// }
	let status;
	try {
		const nknClient = new NKN(credentials);

		nknClient.on('connect', () => {
			console.log( 'connected' );
		});

		nknClient.on('message', (...args) => {
			console.log('Received message:', ...args);
			dispatch(receiveMessage(...args));
		});

		nknClient.on('block', block => {
			console.log('New block!!!',	block);
			let subs = getState().subscriptions;
			for	( let topic of Object.keys(subs) ) {
				// Check that the sub is not yet resolved (not null), then try find it in the block.
				if ( block.transactions.find(tx	=> subs[topic] === tx.hash ) ) {
					dispatch(subscribeCompleted(topic));
				}
			}
		});

		// Can't be cloned but we want to keep this.
		window.nknClient = nknClient;
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
	window.nknClient.publishMessage(topic, message);
	return originalAction;
};

export default {
	'PUBLISH_MESSAGE': publishMessage,
	'LOGIN': login,
	'JOIN_CHAT': joinChat
};
