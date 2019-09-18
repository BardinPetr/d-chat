import {
	genPrivateChatName,
	getChatName,
	isReaction,
} from 'Approot/misc/util';
// import { setBadgeText } from 'Approot/misc/browser-util';
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

export const markUnread = (topic, ids) => (dispatch) => {
	if (ids.length > 0) {
		// getUnreadMessages(getState()).then(count => setBadgeText( count + ids.length ));
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
