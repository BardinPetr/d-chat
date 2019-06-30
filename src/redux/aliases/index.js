import NKN from '../../misc/nkn';
import { setLoginSuccess, enterChatroom, subscribeCompleted } from '../actions';

const subscribe = (transactionID, topic) => ({
	type: 'SUBSCRIBE',
	payload: {
		topic,
		transactionID
	}
});

const joinChat = originalAction => (dispatch, getState) => {
	const topic = originalAction.payload.topic;
	console.log('is anybody out there? Entering moonchat', topic, getState());
	let out;
	if ( topic != null ) {
		out = window.nknClient.subscribe( topic )
			.then(txId => dispatch(subscribe(txId, topic)),
				() => dispatch(subscribeCompleted(topic))
			).then(() => dispatch(enterChatroom(topic)));
	} else {
		out = dispatch(enterChatroom(topic));
	}
	return out;
};

const receiveMessage = (src, payload, payloadType) => {
	console.log('Received a message!', src, 'payload', payload, 'type', payloadType);
	let message = {};
	if ( payloadType === 1 ) { /*	nknClient.PayloadType.TEXT */
		message = JSON.parse(payload);
		message.addr = src;
	}
	return {
		type: 'RECEIVE_MESSAGE',
		payload: {
			message
		}
	};
};

const login = originalAction => (dispatch, getState) => {
	let credentials = originalAction.payload.credentials;
	console.log('is anybody out there? this is moon base.', originalAction, credentials, dispatch, getState);
	// if ( !credentials ) {
	// 	return Promise.reject();
	// }
	try {
		const nknClient = new NKN(credentials);

		nknClient.on('connect', () => {
			console.log( 'connected' );
		});

		nknClient.on('message', (...args) => dispatch(receiveMessage(...args)));

		nknClient.on('block', block => {
			console.log('New block!!!',	block);
			let subs = getState().subscriptions;
			for	( let item in subs ) {
				// Check that the sub is not yet resolved (not null), then try find it in the block.
				if ( block.transactions.find(tx	=> item.id === tx.hash ) ) {
					dispatch(subscribeCompleted(item.topic));
				}
			}
		});

		console.log(nknClient);
		window.nknClient = nknClient;
		return dispatch(setLoginSuccess(true, nknClient.addr));

	} catch (e) {
		console.log('Failed login.', e);
		return dispatch(setLoginSuccess(false));
	}
};

const publishMessage = message => ({
	type: 'PUBLISH_MESSAGE',
	payload: {
		message,
		topic: message.topic
	}
});

export default {
	'RECEIVE_MESSAGE': receiveMessage,
	'PUBLISH_MESSAGE': publishMessage,
	'LOGIN': login,
	'SUBSCRIBE': subscribe,
	'JOIN_CHAT': joinChat
};
