/**
 * TODO: sort out the aliases to the end to make some bookkeeping sense.
 */

import { extension } from 'webextension-polyfill';
import { getChatName, setBadgeText } from 'Approot/misc/util';
import Message from 'Approot/background/Message';
import { PayloadType } from 'nkn-client';


export const logout = () => ({
		type: 'LOGOUT_ALIAS'
});

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

// Aliased
export const login = credentials => ({
	type: 'LOGIN',
	payload: {
		credentials
	}
});

// Aliased
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

// Alias.
export const markRead = (topic, ids) => ({
	type: 'chat/MARK_READ_ALIAS',
	payload: {
		topic,
		ids,
	}
});

export const getUnreadMessages = async state => {
	const chats = Object.values(state.chatSettings);
	return chats.reduce((acc, settings) => acc + (settings.unread?.length || 0), 0);
};

export const markUnread = (topic, ids) => (dispatch, getState) => {
	if (ids.length > 0) {
		getUnreadMessages(getState()).then(count => setBadgeText( count + ids.length ));
	}
	return dispatch({
		type: 'chat/MARK_UNREAD',
		payload: {
			topic,
			ids,
		}
	});
};

/**
 * Called by .on('message') listener.
 */
export const receivingMessage = (src, payload, payloadType) => (dispatch, getState) => {
	let message = {};
	if ( payloadType === PayloadType.TEXT ) {
		const data = JSON.parse(payload);
		message = new Message(data).from(src);
	} else {
		return;
	}

	// Create notification?
	if ( !message.isMe ) {
		let views = extension.getViews({
			type: 'popup'
		});
		// Notify unless chat is open.
		if ( views.length === 0 || ( views.length === 1 && message.topic !== getState().topic ) ) {
			message.notify();

			// Make this one work for all types of views.
			dispatch( markUnread(message.topic, [message.id]) );
		}
	}

	return dispatch(receiveMessage(message));
};
