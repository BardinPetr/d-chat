/**
 * TODO: sort out the aliases to the end to make some bookkeeping sense.
 */

import { extension } from 'webextension-polyfill';
import { getChatName } from 'Approot/misc/util';
import Message from 'Approot/background/Message';
import { PayloadType } from 'nkn-client';

export const saveDraft = text => ({
	type: 'SAVE_DRAFT',
	payload: {
		content: text
	}
});

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

export const markRead = (topic, ids) => ({
	type: 'chat/MARK_READ',
	payload: {
		topic,
		ids,
	}
});

export const markUnread = (topic, ids) => ({
	type: 'chat/MARK_UNREAD',
	payload: {
		topic,
		ids,
	}
});

/**
 * Called by .on('message') listener.
 */
export const receivingMessage = (src, payload, payloadType) => (dispatch, getState) => {
	let message = {};
	if ( payloadType === PayloadType.TEXT ) {
		const data = JSON.parse(payload);
		message = new Message(data).from(src);
		dispatch( markUnread(message.topic, [message.id]) );
	} else {
		return;
	}

	// Create notification?
	if ( !message.isMe ) {
		let views = extension.getViews({
			type: 'popup'
		});
		// If chat is open, no notification.
		if ( views.length === 0 || ( views.length === 1 && message.topic !== getState().topic ) ) {
			message.notify();
		}
	}

	return dispatch(receiveMessage(message));
};
