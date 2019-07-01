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

export const receiveMessage = (src, payload, payloadType)  => {
	console.log('Received a message!', src, 'payload', payload, 'type', payloadType);
	let message = {};
	if ( payloadType === 1 ) { /*	nknClient.PayloadType.TEXT */
		message = JSON.parse(payload);
		message.addr = src;
		message.username = src.slice(0, src.lastIndexOf('.'));
	}
	console.log('Receiving mission:', src, window.nknClient.addr);
	if ( src === window.nknClient.addr ) {
		message.isMe = true;
	}
	console.log('This is the message', message);
	return {
		type: 'RECEIVE_MESSAGE',
		payload: {
			message,
			topic: message.topic
		}
	};
};
