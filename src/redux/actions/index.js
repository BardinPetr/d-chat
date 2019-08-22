/**
 * TODO: sort out the aliases to the end to make some bookkeeping sense.
 */

import { __, getChatName, setBadgeText } from 'Approot/misc/util';
import Message from 'Approot/background/Message';
import { PayloadType } from 'nkn-client';
import { handleMessage } from './Messaging';
import { actions as toastr } from 'react-redux-toastr';

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
	dispatch(toastr.add({
		type: 'success',
		title: __('Subscription Confirmed'),
		message: __('Successfully subscribed to') + ` #${topic}.`,
	}));
	return dispatch({
		type: 'SUBSCRIBE_COMPLETED',
		payload: {
			topic: getChatName( topic )
		}
	});
};

export const subscribe = (topic, transactionID) => ({
	type: 'SUBSCRIBE',
	payload: {
		topic: getChatName( topic ),
		transactionID
	}
});

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
	const toastTitle = data.outgoing ? __('Outgoing Transaction') : __('Incoming Transaction');
	dispatch(toastr.add({
		type: 'info',
		title: toastTitle,
		message: `${data?.value?.toFixed(8) || '?'}NKN.`,
	}));
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

	return handleMessage(message, dispatch);
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

	let title = data.outgoing ? __('Outgoing Transaction') : __('Incoming Transaction');
	title += ' ' + __('Confirmed');

	dispatch(toastr.add({
		type: 'success',
		title:  title,
		message: `${data.value?.toFixed(8) || '?'}NKN.`,
		// TODO add link to #/transactions/:id or something.
	}));

	return dispatch({
		type: 'nkn/TRANSACTION_COMPLETE',
		payload: {
			transactionID,
			data,
		},
	});
};
