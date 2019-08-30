import {
	genPrivateChatName,
	__,
	getChatDisplayName,
	getChatName,
	setBadgeText,
} from 'Approot/misc/util';
import Message from 'Approot/background/Message';
import { PayloadType } from 'nkn-client';
import sleep from 'sleep-promise';

export const navigated = to => ({
	type: 'ui/NAVIGATED',
	payload: {
		to,
	},
});

export const getBalance = () => ({
	type: 'GET_BALANCE_ALIAS',
});

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
	type: 'CONNECTED',
});

export const subscribeCompleted = topic => dispatch => {
	dispatch(getSubscribers(topic));

	new Message({
		topic,
		contentType: 'dchat/subscribe',
		content: __('Subscription confirmed. You are now receiving messages from') + ` ${getChatDisplayName(topic)}.`,
		isPrivate: true,
	}).receive(dispatch);

	return dispatch({
		type: 'SUBSCRIBE_COMPLETED',
		payload: {
			topic: getChatName( topic ),
		},
	});
};

export const sendPrivateMessage = (message) => ({
	type: 'SEND_PRIVATE_MESSAGE_ALIAS',
	payload: {
		recipient: message.topic,
		message: {
			...message,
			isPrivate: true,
		},
	},
});

export const subscribe = (topic, transactionID) => (dispatch) => {
	new Message({
		topic,
		contentType: 'dchat/subscribe',
		content: __('Subscribing to') + ' ' + getChatDisplayName(topic) + '.\n\n' + __('You can send messages, but you will not receive them until your subscription is confirmed.'),
		isPrivate: true,
	}).receive(dispatch);

	dispatch({
		type: 'SUBSCRIBE',
		payload: {
			topic: getChatName( topic ),
			transactionID
		}
	});
};

// An alias.
export const getSubscribers = topic => ({
	type: 'chat/GET_SUBSCRIBERS_ALIAS',
	payload: {
		topic: getChatName( topic )
	}
});

export const setSubscribers = (topic, subscribers) => ({
	type: 'chat/SET_SUBSCRIBERS',
	payload: {
		topic,
		subscribers,
	},
});

export const enterPrivateChat = recipient => createChat(genPrivateChatName(recipient));

export const joinChat = topic => ({
	type: 'JOIN_CHAT_ALIAS',
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

export const receiveMessage = message => ({
	type: 'RECEIVE_MESSAGE',
	payload: {
		message,
		topic: getChatName(message.topic),
	},
});

// Alias.
export const markRead = (topic, ids, options = {}) => ({
	type: 'chat/MARK_READ_ALIAS',
	payload: {
		topic,
		ids,
		options,
	}
});

// Helper. Not an action.
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

export const createTransaction = (id, data) => ({
	type: 'nkn/CREATE_TRANSACTION',
	payload: {
		transactionID: id,
		data,
	},
});

/**
 * Called by .on('message') listener.
 */
export const receivingMessage = (src, payload, payloadType) => (dispatch) => {
	let message = {};
	if ( payloadType === PayloadType.TEXT ) {
		const data = JSON.parse(payload);
		message = new Message(data).from(src);
	} else {
		return;
	}

	return message.receive(dispatch);
};

export const newTransaction = ({ targetID, content, topic, to, value, contentType, ...rest }) => ({
	type: 'nkn/NEW_TRANSACTION_ALIAS',
	payload: {
		value: value * 10 ** -8,
		to,
		topic,
		contentType,
		content,
		targetID,
		...rest,
	}
});

const subscribeToChat = topic => ({
	type: 'SUBSCRIBE_TO_CHAT_ALIAS',
	payload: {
		topic,
	},
});

// Subscribing on outgoing & incoming tx's. Whatever, man. Need to rework subscriptions anyway.
export const transactionComplete = completedTransactionID => (dispatch, getState) => {
	const { unconfirmed } = getState().transactions;
	const { transactionID, data } = unconfirmed.find(tx => completedTransactionID === tx.transactionID);

	if (data.contentType === 'nkn/tip') {
		// Timeout 1sec to avoid potential "no funds" errors.
		sleep(1000).then(() => dispatch(subscribeToChat(data.topic)));
	}

	// Timeout 1sec to avoid potential "no funds" errors.
	sleep(1000).then(() => dispatch(getBalance()));

	return dispatch({
		type: 'nkn/TRANSACTION_COMPLETE',
		payload: {
			transactionID,
			data,
		},
	});
};

export const removeChat = topic => ({
	type: 'chat/REMOVE',
	payload: {
		topic,
	},
});
