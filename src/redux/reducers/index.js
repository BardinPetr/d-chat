import { combineReducers } from 'redux';
import configs from '../../misc/configs-APP_TARGET';
import clients from './client';

// Used for detecting changes in database from UI.
const messageEvent = (_, action) => {
	let newState = {};
	switch (action.type) {
		case 'chat/MODIFY_MESSAGE':
			newState = {
				topic: action.payload.topic,
				message: action.payload.message,
				type: 'modify',
			};
			break;

		case 'chat/RECEIVE_MESSAGE':
			newState = {
				topic: action.payload.topic,
				message: action.payload.message,
				type: 'new',
			};
			break;

		case 'chat/RECEIVE_REACTION':
			newState = {
				topic: action.payload.topic,
				reaction: action.payload.message,
				type: 'new',
			};
			break;
	}
	return newState;
};

const login = (state = {}, action) => {
	let newState;
	switch (action.type) {
		case 'LOGIN':
			newState = action.payload.credentials;
			break;

		case 'LOGIN_STATUS':
			if (action.error) {
				newState = { error: action.error };
			} else {
				newState = action.payload;
			}
			break;

		case 'CONNECTED':
			newState = {
				...state,
				connected: true,
			};
			break;

		case 'LOGOUT':
			newState = {};
			break;

		default:
			newState = state;
	}
	return newState;
};

const draftMessage = (state = '', action) => {
	let newState;
	switch (action.type) {
		case 'SAVE_DRAFT':
			newState = action.payload.content;
			break;

		default:
			newState = state;
	}
	return newState;
};

/**
 * Handles individual chat (topic) settings.
 *
 * Have one type of action type like `chat/SET_OPTION` and derive actions from that,
 * or, like currently, have a distinct action type for each?
 *
 * TODO "remove chat", which unsubscribes.
 */
const chatSettings = (state = {}, action) => {
	let newState, initial;
	const topic = action.payload?.topic;

	switch (action.type) {
		case 'chat/REMOVE':
			newState = {
				...state,
				[topic]: {
					...state[topic],
					unread: [],
					hidden: true,
				}
			};
			configs.chatSettings = newState;
			break;

		case 'chat/MARK_UNREAD':
			initial = state[topic]?.unread || [];
			newState = {
				...state,
				[topic]: {
					...state[topic],
					unread: [...initial, action.payload.message.id],
					receivedAt: Date.now(),
					// New messages bring hidden topics back.
					hidden: false,
				},
			};
			configs.chatSettings = newState;
			break;

		case 'chat/MARK_READ':
			// Grab all unread messages.
			initial = state[topic]?.unread || [];
			newState = {
				...state,
				[topic]: {
					...state[topic],
					// Filter out newly read message from unread messages.
					unread: initial.filter(i => !action.payload.ids.some(id => i === id)),
				},
			};
			configs.chatSettings = newState;
			break;

		case 'chat/CREATE_CHAT':
			newState = {
				...state,
				[topic]: {
					unread: [],
					subscribers: [],
					subscribersMeta: [],
					receivedAt: 1,
					...state[topic],
					hidden: false,
				},
			};
			configs.chatSettings = newState;
			break;

		case 'chat/SET_SUBSCRIBERS':
			newState = {
				...state,
				[topic]: {
					...state[topic],
					subscribers: action.payload.subscribers,
				},
			};
			break;

		case 'chat/SET_SUBSCRIPTION_INFOS':
			newState = {
				...state,
				[topic]: {
					// We need to set these just for the public topics list.
					unread: [],
					subscribers: [],
					...state[topic],
					subscribersMeta: action.payload.data,
				},
			};
			break;

		case 'chat/SET_CHAT_MUTE':
			newState = {
				...state,
				[topic]: {
					...state[topic],
					muted: action.payload.muted,
				},
			};
			configs.chatSettings = newState;
			break;

		default:
			newState = state;
	}
	return newState;
};

// Most recent open page, where re-opening popup will start.
const navigation = (state = { mostRecentPage: '/' }, action) => {
	let newState;
	switch (action.type) {
		case 'ui/NAVIGATED':
			newState = {
				...state,
				mostRecentPage: action.payload.to,
			};
			break;

		default:
			newState = state;
	}
	return newState;
};

export default combineReducers({
	login,
	clients,
	// Chat.
	chatSettings,

	messageEvent,

	// UI
	draftMessage,
	navigation,
});
