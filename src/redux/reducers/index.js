import { combineReducers } from 'redux';
import configs from '../../misc/configs-APP_TARGET';
import clients from './client';

const activeTopics = (state = [], action) => {
	let newState;
	const topic = action.payload?.topic;

	switch (action.type) {
		case 'chat/CREATE_CHAT':
			newState = new Set(state);
			newState.add(topic);
			newState = Array.from(newState);
			break;

		case 'ui/REMOVE_ACTIVE_TOPIC':
		case 'chat/REMOVE':
			newState = state.filter(i => i !== topic);
			break;

		default:
			newState = state;
	}
	return newState;
};

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

		default:
			newState = {};
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

const globalSettings = (state = {
	muted: [],
}, action) => {
	let newState;

	switch (action.type) {
		case 'settings/TOGGLE_USER_MUTE':
			if (state.muted.includes(action.payload.addr)) {
				newState = {
					...state,
					muted: state.muted.filter(user => user !== action.payload.addr),
				};
			} else {
				newState = {
					...state,
					muted: [...state.muted, action.payload.addr],
				};
			}
			configs.globalSettings = newState;
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
					name: topic,
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
			newState = {
				...state,
				[topic]: {
					...state[topic],
					unread: [],
				},
			};
			configs.chatSettings = newState;
			break;

		case 'chat/CREATE_CHAT':
			newState = {
				...state,
				[topic]: {
					name: topic,
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

	globalSettings,

	// UI
	navigation,
	activeTopics,
});
