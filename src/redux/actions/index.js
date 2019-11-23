/**
 * Contains almost all actions.
 */
import {
	genPrivateChatName,
	getChatName,
	getWhisperRecipient,
} from 'Approot/misc/util';

// So that next time you open popup, it continues where you left off.
export const navigated = to => ({
	type: 'ui/NAVIGATED',
	payload: {
		to,
	},
});

export const logout = () => ({
	type: 'LOGOUT_ALIAS',
});

// So that next time you open popup, it continues where you left off.
export const saveDraft = text => ({
	type: 'SAVE_DRAFT',
	payload: {
		content: text,
	},
});

export const connected = () => ({
	type: 'CONNECTED',
});

// Whispers/topics use nkn.send/publish respectively, so it's probably -
// not a bad idea to separate them at action level.
export const sendPrivateMessage = message => ({
	type: 'SEND_PRIVATE_MESSAGE_ALIAS',
	payload: {
		recipient: getWhisperRecipient(message.topic),
		message: {
			...message,
			topic: undefined,
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

// Join chat dispatches createChat and subscribeToChat.
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

// Used in marking message-received.
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

// Options is { fee: 0, metadata: obj? }.
// Metadata exists when adding topic to public topics list.
export const subscribeToChat = (topic, options = {}) => ({
	type: 'SUBSCRIBE_TO_CHAT_ALIAS',
	payload: {
		topic,
		options,
	},
});

// Removes chat from the sidebar list by deleting chatSettings[topic].
export const removeChat = topic => ({
	type: 'chat/REMOVE',
	payload: {
		topic,
	},
});

// Get everyone's subscription metadata.
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

export const muteChat = (topic, muted) => ({
	type: 'chat/SET_CHAT_MUTE',
	payload: {
		topic,
		muted,
	},
});
