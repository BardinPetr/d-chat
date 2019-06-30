export const subscribeCompleted = topic => ({
	type: 'SUBSCRIBE_COMPLETED',
	payload: {
		topic
	}
});

// const subscribe = (transactionID, topic) => ({
// 	type: 'SUBSCRIBE',
// 	payload: {
// 		topic,
// 		transactionID
// 	}
// });

export const enterChatroom = topic => ({
	type: 'ENTER_CHAT',
	payload: {
		topic,
	}
});

export const joinChat = topic => ({
	type: 'JOIN_CHAT',
	payload: {
		topic
	}
});

export const setLoginSuccess = (isSuccess, addr) => ({
	type: 'LOGIN_SUCCESS',
	error: !isSuccess,
	payload: {
		addr
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
	}
	return {
		type: 'RECEIVE_MESSAGE',
		payload: {
			message
		}
	};
};
