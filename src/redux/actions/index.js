import { genPrivateChatName, getChatName } from 'Approot/misc/util';

export const navigated = to => ({
	type: 'ui/NAVIGATED',
	payload: {
		to,
	},
});

export const getBalance = address => ({
	type: 'nkn/GET_BALANCE_ALIAS',
	payload: {
		address,
	},
});

export const logout = () => ({
	type: 'LOGOUT_ALIAS',
});

export const saveDraft = text => ({
	type: 'SAVE_DRAFT',
	payload: {
		content: text,
	},
});

export const connected = () => ({
	type: 'CONNECTED',
});

export const sendPrivateMessage = message => ({
	type: 'SEND_PRIVATE_MESSAGE_ALIAS',
	payload: {
		recipient:
			message.topic.startsWith('/whisper/')
				? message.topic.slice('/whisper/'.length)
				: message.topic,
		message: {
			...message,
			topic: undefined,
			isPrivate: true,
			isWhisper: true,
		},
	},
});

export const getSubscribers = topic => ({
	type: 'chat/GET_SUBSCRIBERS_ALIAS',
	payload: {
		topic: getChatName(topic),
	},
});

export const setSubscribers = (topic, subscribers) => ({
	type: 'chat/SET_SUBSCRIBERS',
	payload: {
		topic,
		subscribers,
	},
});

export const enterPrivateChat = recipient =>
	createChat(genPrivateChatName(recipient));

export const joinChat = topic => ({
	type: 'JOIN_CHAT_ALIAS',
	payload: {
		topic: getChatName(topic),
	},
});

export const createChat = topic => ({
	type: 'chat/CREATE_CHAT',
	payload: {
		topic: getChatName(topic),
	},
});

export const setLoginStatus = status => ({
	type: 'LOGIN_STATUS',
	error: status.error,
	payload: {
		addr: status.addr,
	},
});

export const login = credentials => ({
	type: 'LOGIN_ALIAS',
	payload: {
		credentials,
	},
});

export const publishMessage = message => ({
	type: 'PUBLISH_MESSAGE_ALIAS',
	payload: {
		message,
		topic: getChatName(message.topic),
	},
});

export const modifyMessage = (topic, id, modifiedMessage) => ({
	type: 'chat/MODIFY_MESSAGE',
	payload: {
		topic,
		id,
		modifiedMessage,
	},
});

export const receiveMessage = message => {
	// Receive tips as messages.
	let type = 'chat/RECEIVE_MESSAGE';
	if (message.contentType === 'reaction') {
		type = 'chat/RECEIVE_REACTION';
	}

	return {
		type,
		payload: {
			message,
			topic: getChatName(message.topic),
		},
	};
};

export const markRead = (topic, ids) => ({
	type: 'chat/MARK_READ',
	payload: {
		topic,
		ids,
	},
});

export const markUnread = (topic, message) => ({
	type: 'chat/MARK_UNREAD',
	payload: {
		topic,
		message,
	},
});

export const newTransaction = ({
	targetID,
	content,
	topic,
	to,
	value,
	contentType,
	...rest
}) => ({
	type: 'nkn/NEW_TRANSACTION_ALIAS',
	payload: {
		value: value * 10 ** -8,
		to,
		topic,
		contentType,
		content,
		targetID,
		...rest,
	},
});

export const subscribeToChat = (topic, options = {}) => ({
	type: 'SUBSCRIBE_TO_CHAT_ALIAS',
	payload: {
		topic,
		options,
	},
});

export const removeChat = topic => ({
	type: 'chat/REMOVE',
	payload: {
		topic,
	},
});

export const fetchSubscriptionInfos = topic => ({
	type: 'chat/FETCH_SUBSCRIPTION_INFOS_ALIAS',
	payload: {
		topic,
	},
});

export const setSubscriptionInfos = (topic, data) => ({
	type: 'chat/SET_SUBSCRIPTION_INFOS',
	payload: {
		topic,
		data,
	},
});

export const removeMessageById = (topic, id) => ({
	type: 'chat/REMOVE_MESSAGE_BY_ID',
	payload: {
		topic,
		id,
	},
});
