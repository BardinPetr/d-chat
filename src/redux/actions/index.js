/**
 * TODO: sort out the aliases to the end to make some bookkeeping sense.
 */

import { __, getChatDisplayName, getChatName, setBadgeText, createNotification } from 'Approot/misc/util';
import Message from 'Approot/background/Message';
import { PayloadType } from 'nkn-client';

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
			topic: getChatName( topic )
		}
	});
};

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

export const receiveMessage = message => ({
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

export const createTransaction = (id, data) => dispatch => {
	console.log('Creating transaction', id, data);
	return dispatch({
		type: 'nkn/CREATE_TRANSACTION',
		payload: {
			transactionID: id,
			data,
		},
	});
};

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

export const newTransaction = ({ topic, to, value, contentType, ...rest }) => ({
	type: 'nkn/NEW_TRANSACTION_ALIAS',
	payload: {
		value: value * 10 ** -8,
		to,
		topic,
		contentType,
		...rest,
	}
});

const subscribeToChat = topic => ({
	type: 'SUBSCRIBE_TO_CHAT_ALIAS',
	payload: {
		topic,
	},
});

export const transactionComplete = completedTransactionID => (dispatch, getState) => {
	const { unconfirmed } = getState().transactions;
	const { transactionID, data } = unconfirmed.find(tx => completedTransactionID === tx.transactionID);

	switch (data.contentType) {
		case 'nkn/tip':
			dispatch(subscribeToChat(data.topic));
			break;
	}

	let title, flag;
	if (data.to === window.nknClient.addr) {
		title = __('Incoming');
		flag = true;
	} else if (data.addr === window.nknClient.addr) {
		title = __('Outgoing');
		flag = true;
	}
	if (flag) {
		// Transaction was TO or FROM me, so notify.
		title += ' ' + __('Transaction Confirmed');
		console.log(title, 'transactionComplete:', data);
		createNotification({
			title,
		});
	}

	return dispatch({
		type: 'nkn/TRANSACTION_COMPLETE',
		payload: {
			transactionID,
			data,
		},
	});
};
