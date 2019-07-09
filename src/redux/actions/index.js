import { runtime, extension, browserAction, notifications } from 'webextension-polyfill';
import configs from '../../misc/configs';

export const connected = () => ({
	type: 'CONNECTED'
});

export const subscribeCompleted = topic => ({
	type: 'SUBSCRIBE_COMPLETED',
	payload: {
		topic
	}
});

// TODO
// export const subscribeErrored = error => ({
// 	type: 'SUBSCRIBE_ERRORED',
// 	payload: {
// 		error
// 	}
// });

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

const receiveMessage = message => ({
	type: 'RECEIVE_MESSAGE',
	payload: {
		message,
		topic: message.topic
	}
});

let counter = 0;
let timeout;
export const receivingMessage = (src, payload, payloadType) => (dispatch, getState) => {
	let message = {};
	// console.log('Received a message!', src, 'payload', payload, 'type', payloadType, 'encrypt', encrypt);
	if ( payloadType === 1 ) { /*	nknClient.PayloadType.TEXT */
		message = JSON.parse(payload);
		message.addr = src;
		let splitPart = src.lastIndexOf('.');
		if ( splitPart !== -1 ) {
			message.username = src.slice(0, splitPart);
		}
		if ( ! message.username ){
			message.username = 'Pseudonymous';
		}
	}
	if (message.timestamp) {
		message.ping = new Date().getTime() - new Date(message.timestamp).getTime();
		console.log('timestamp exitsted', message);
	} else {
		message.ping = 0;
	}
	if ( src === window.nknClient.addr ) {
		message.isMe = true;
	} else {
		// So long purity.
		counter++;
		let views = extension.getViews();
		// If chat is open, no notifications.
		views = views.filter(view => !view.document.hidden);
		console.log('Active views:', views);
		// Background is always there.
		if ( views.length <= 1 || message.topic !== getState().topic ) {
			browserAction.getBadgeText({})
				.then(text => {
					let count;
					if ( !text ){
						count = counter;
					} else {
						count = +text + 1;
					}
					browserAction.setBadgeText({
						text: String(count)
					});

					// On startup, the numbers go all wrong. Attempted fix.
					if ( timeout ) {
						clearTimeout(timeout);
					}
					// Otherwise it will be zero.
					timeout = setTimeout(() => counter = 0, 100);

					if ( configs.showNotifications ) {
						notifications.create(
							'',
							{
								type: 'basic',
								message: message.content,
								title: 'D-Chat #' + message.topic + ', ' + message.username + ':',
								iconUrl: runtime.getURL('/img/icon2.png'),
							}
						);
					}
				});
		}
	}

	return dispatch(receiveMessage(message));
};
