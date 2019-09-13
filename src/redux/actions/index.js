import {
	genPrivateChatName,
	__,
	getChatName,
	setBadgeText,
	isReaction,
} from 'Approot/misc/util';
import Message from 'Approot/background/Message';
import { PayloadType } from 'nkn-client';
import sleep from 'sleep-promise';
import NKN from 'Approot/background/nknHandler';


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

export const subscribe = (topic, transactionID) => ({
	type: 'SUBSCRIBE',
	payload: {
		topic: getChatName( topic ),
		transactionID
	}
});

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
	type: 'chat/CREATE_CHAT',
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
	type: 'LOGIN_ALIAS',
	payload: {
		credentials
	}
});

export const publishMessage = message => ({
	type: 'PUBLISH_MESSAGE_ALIAS',
	payload: {
		message,
		topic: getChatName(message.topic)
	}
});

export const receiveMessage = message => {
	let type = 'chat/RECEIVE_MESSAGE';
	if ( isReaction( message ) ) {
		type = 'chat/RECEIVE_REACTION';
	}

	return ({
		type,
		payload: {
			message,
			topic: getChatName(message.topic),
		},
	});
};

export const markRead = (topic, ids) => ({
	type: 'chat/MARK_READ_ALIAS',
	payload: {
		topic,
		ids,
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
export const receivingMessage = (src, payload, payloadType) => (dispatch, getState) => {
	let message = {};
	if ( payloadType === PayloadType.TEXT ) {
		const data = JSON.parse(payload);
		message = new Message(data);

		if ( message.topic && message.contentType === 'nkn/tip' && message.isPrivate ) {
			const subs = getState().chatSettings[message.topic]?.subscribers || [];
			// TODO hmmm...
			if ( NKN.instance && !subs.includes(NKN.instance.addr) ) {
				new Message({
					contentType: 'dchat/subscribe',
					topic: message.topic,
					content: __('You have been tipped. Subscribing once tx is confirmed.')
				}).receive(dispatch);
			}
		}

		message = message.from(src);
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
		// Timeout 5sec to avoid potential "no funds" errors. Still throws sometimes.
		sleep(5000).then(() => dispatch(subscribeToChat(data.topic)));
	}

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

// Don't change a reaction into a message.
export const modifyMessage = (id, topic, modifiedMessage) => {
	let type = 'chat/MODIFY_MESSAGE';
	if ( isReaction(modifiedMessage) ) {
		type = 'chat/MODIFY_REACTION';
	}

	return ({
		type,
		payload: {
			id,
			topic,
			message: modifiedMessage,
		},
	});
};
