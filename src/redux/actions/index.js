/**
 * Contains almost all actions.
 */
import {
	getChatName,
	getWhisperRecipient,
	isWhisper,
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

export const connected = () => ({
	type: 'CONNECTED',
});

// Whispers/topics use nkn.send/publish respectively, so it's probably -
// not a bad idea to separate them at action level.
export const sendPrivateMessage = (message, options) => ({
	type: 'SEND_PRIVATE_MESSAGE_ALIAS',
	payload: {
		recipient: getWhisperRecipient(message.topic),
		message: {
			...message,
			topic: undefined,
			isPrivate: isWhisper(message) ? true : undefined,
		},
		options,
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

export const login = (credentials, address, seed) => ({
	type: 'LOGIN_ALIAS',
	payload: {
		credentials,
		seed,
		address,
	},
});

export const publishMessage = message => ({
	type: 'PUBLISH_MESSAGE_ALIAS',
	payload: {
		message,
		topic: getChatName(message.topic),
	},
});

// Creates message based on the topic.
// Flipside is that topics like `/whisper/x` will be treated as whispers instead, -
// but ehh, kind of an edge case.
export const createMessage = message =>
	isWhisper(message)
		? sendPrivateMessage(message)
		: publishMessage(message);

export const receiveMessage = message => {
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

// The modified message's ID will be used for matching.
export const modifyMessage = (modified) => ({
	type: 'chat/MODIFY_MESSAGE',
	payload: {
		topic: getChatName(modified.topic),
		message: modified,
	},
});

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

// Removes chat from the sidebar list by setting chatSettings[topic].hidden = true.
export const removeChat = topic => ({
	type: 'chat/REMOVE',
	payload: {
		topic,
	},
});

export const unsubscribeChat = topic => ({
	type: 'chat/UNSUBSCRIBE_ALIAS',
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

export const muteChat = (topic, muted) => ({
	type: 'chat/SET_CHAT_MUTE',
	payload: {
		topic,
		muted,
	},
});

export const removeActiveTopic = topic => ({
	type: 'ui/REMOVE_ACTIVE_TOPIC',
	payload: {
		topic,
	},
});

// Permissioned pubsub.
export const acceptPermission = (addr, topic) => ({
	type: 'chat/ACCEPT_TO_CHATROOM_ALIAS',
	payload: {
		addr,
		topic,
	},
});
export const removePermission = (addr, topic) => ({
	type: 'chat/REMOVE_ACCEPT_TO_CHATROOM_ALIAS',
	payload: {
		addr,
		topic,
	},
});


// Video conferencing
export const beginVideoSession = (port, peers) => ({
	type: 'videosession/BEGIN',
	payload: {peers},
	meta: {
		workertransfer: [port]
	}
});

export const endVideoSession = () => ({
	type: 'videosession/END',
	payload: {},
});

export const gotPeerSession = (port, peer) => ({
	type: 'videosession/ESTABLISHED',
	payload: {peer, port},
	meta: {
		workertransfer: [port]
	}
});
