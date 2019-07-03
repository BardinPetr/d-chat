import { browserAction } from 'webextension-polyfill';

export const connected = () => ({
	type: 'CONNECTED'
});

export const subscribeCompleted = topic => ({
	type: 'SUBSCRIBE_COMPLETED',
	payload: {
		topic
	}
});

export const subscribe = (topic, transactionID) => ({
	type: 'SUBSCRIBE',
	payload: {
		topic,
		transactionID
	}
});

// Handles subscribing (background). An alias.
export const joinChat = topic => ({
	type: 'JOIN_CHAT',
	payload: {
		topic
	}
});

// Handles UI changes with JOIN_CHAT.
export const enterChat = topic => ({
	type: 'ENTER_CHAT',
	payload: {
		topic
	}
});

export const createChat = topic => ({
	type: 'CREATE_CHAT',
	payload: {
		topic
	}
});

export const setLoginStatus = status => ({
	type: 'LOGIN_STATUS',
	error: status.error,
	payload: {
		addr: status.addr
	}
});

export const login = credentials => ({
	type: 'LOGIN',
	payload: {
		credentials
	}
});

export const publishMessage = message => ({
	type: 'PUBLISH_MESSAGE',
	payload: {
		message,
		topic: message.topic
	}
});

export const receiveMessage = (src, payload, payloadType, encrypt)  => {
	let message = {};
	console.log('Received a message!', src, 'payload', payload, 'type', payloadType, 'encrypt', encrypt);
	if ( payloadType === 1 ) { /*	nknClient.PayloadType.TEXT */
		message = JSON.parse(payload);
		message.addr = src;
		message.username = src.slice(0, src.lastIndexOf('.'));
	}
	if ( src === window.nknClient.addr ) {
		message.isMe = true;
	} else {
		browserAction.getBadgeText({})
			.then(text => browserAction.setBadgeText({
				text: String(+text+1)
			}));
	}

	return {
		type: 'RECEIVE_MESSAGE',
		payload: {
			message,
			topic: message.topic
		}
	};
};
