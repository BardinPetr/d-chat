import { runtime, extension, browserAction, notifications } from 'webextension-polyfill';
import configs from '../../misc/configs';
import { getChatName } from '../../misc/util';

export const connected = () => ({
	type: 'CONNECTED'
});

export const subscribeCompleted = topic => ({
	type: 'SUBSCRIBE_COMPLETED',
	payload: {
		topic: getChatName( topic )
	}
});

export const subscribe = (topic, transactionID) => ({
	type: 'SUBSCRIBE',
	payload: {
		topic: getChatName( topic ),
		transactionID
	}
});

export const setSubscribers = (topic, subscribers) => ({
	type: 'SET_SUBSCRIBERS',
	payload: {
		topic: getChatName( topic ),
		subscribers,
	}
});

// An alias.
export const getSubscribers = topic => ({
	type: 'GET_SUBSCRIBERS',
	payload: {
		topic: getChatName( topic )
	}
});

// Handles subscribing (background). An alias.
export const joinChat = topic => ({
	type: 'JOIN_CHAT',
	payload: {
		topic: getChatName( topic )
	}
});

// Handles UI changes with JOIN_CHAT.
export const enterChat = topic => ({
	type: 'ENTER_CHAT',
	payload: {
		topic: getChatName( topic )
	}
});

export const createChat = topic => ({
	type: 'CREATE_CHAT',
	payload: {
		topic: getChatName( topic )
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
		topic: getChatName(message.topic)
	}
});

const receiveMessage = message => ({
	type: 'RECEIVE_MESSAGE',
	payload: {
		message,
		topic: getChatName(message.topic)
	}
});

let counter = 0;
let timeout;
const notify = (message) => {
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
};

export const receivingMessage = (src, payload, payloadType) => (dispatch, getState) => {
	const now = new Date().getTime();
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
		message.topic = message.topic ? getChatName( message.topic ) : null;
	}
	if (message.timestamp) {
		message.ping = now - new Date(message.timestamp).getTime();
	} else {
		message.ping = 0;
	}
	if ( src === window.nknClient.addr ) {
		message.isMe = true;
	} else {
		counter++;
		let views = extension.getViews({
			type: 'popup'
		});
		// If chat is open, no notifications.
		views = views.filter(view => !view.document.hidden);
		console.log('Active views:', views);
		if ( views.length === 0 || message.topic !== getState().topic ) {
			notify(message);
		}
	}

	return dispatch(receiveMessage(message));
};
