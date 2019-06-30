import {  } from '../../misc/util';
import NKN from '../../misc/nkn';

export const subscribeCompleted = topic => ({
	type: 'SUBSCRIBE_COMPLETED',
	payload: {
		topic
	}
});

const subscribe = (transactionID, topic) => ({
	type: 'SUBSCRIBE',
	payload: {
		topic,
		transactionID
	}
});

const enterChatroom = topic => ({
	type: 'ENTER_CHAT',
	payload: {
		topic,
	}
});

export const joinChat = topic => (dispatch, getState) => {
	console.log('is anybody out there? Entering moonchat', topic, getState());
	let out;
	if ( topic != null ) {
		out = getState().nkn.subscribe( topic )
			.then(txId => dispatch(subscribe(txId, topic)),
				() => dispatch(subscribeCompleted(topic))
			).then(() => dispatch(enterChatroom(topic)));
	} else {
		out = dispatch(enterChatroom(topic));
	}
	return out;
};

const setLoginSuccess = (isSuccess, nkn, addr) => ({
	type: 'LOGIN_SUCCESS',
	error: !isSuccess,
	payload: {
		addr,
		nkn
	}
});

export const login = credentials => (dispatch, getState) => {
	console.log('is anybody out there? this is moon base.', credentials, dispatch, getState);
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
		dispatch(setLoginSuccess(true, JSON.parse(JSON.stringify(nknClient)), nknClient.addr))
			.then(() => dispatch(joinChat(null)));

	} catch (e) {
		console.log('Failed login.');
		return dispatch(setLoginSuccess(false));
	}
};

export const publishMessage = message => ({
	type: 'PUBLISH_MESSAGE',
	payload: {
		message,
		topic: message.topic
	}
});

export const receiveMessage = (src, payload, payloadType)  => {
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
