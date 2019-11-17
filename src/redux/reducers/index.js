import { combineReducers } from 'redux';
import configs from '../../misc/configs-APP_TARGET';
import clients from './client';

const reactions = (state = {}, action) => {
	let newState, initial, targetID;
	const topic = action.payload?.topic;

	switch (action.type) {
		case 'chat/CLEAN_REACTIONS':
		case 'chat/CLEAN_ALL':
			newState = {};
			configs.reactions = {};
			break;

		case 'chat/RECEIVE_REACTION':
			targetID = action.payload.message.targetID;
			initial = state[topic]?.[targetID] || [];
			newState = {
				...state,
				[topic]: {
					...state[topic],
					[targetID]: [...initial, action.payload.message],
				},
			};
			configs.reactions = newState;
			break;

		case 'chat/CREATE_CHAT':
			newState = {
				...state,
				[topic]: state[topic] || {},
			};
			configs.reactions = newState;
			break;

		case 'chat/REMOVE':
			newState = {
				...state,
				[topic]: {},
			};
			configs.reactions = newState;
			break;

		default:
			newState = state;
	}
	return newState;
};

/**
 * Lazy loading doesn't make sense, because saving history gets bugged.
 * configs.messages = {...} is an async operation, and so
 * if not keeping the history in memory, we will get bad updates.
 * Then we have to load the history from storage.local all the time, so why not just keep it.
 */
const messages = (state = {}, action) => {
	let newState, initial;
	const topic = action.payload?.topic;

	switch (action.type) {
		case 'chat/REMOVE_MESSAGE_BY_ID':
			newState = {
				...state,
				[topic]: state[topic].filter(msg => msg.id !== action.payload.id),
			};
			configs.messages = newState;
			break;

		case 'chat/CLEAN_ALL':
			newState = {};
			configs.messages = {};
			break;

		case 'chat/REMOVE':
			newState = state;
			break;

		case 'chat/RECEIVE_MESSAGE':
			initial = state[topic] || [];
			newState = {
				...state,
				[topic]: [...initial, action.payload.message],
			};
			configs.messages = newState;
			break;

		case 'chat/MODIFY_MESSAGE':
			initial = [...state[topic]] || [];
			newState = {
				...state,
				[topic]: initial.map(ii => {
					const i = {...ii};
					if (i.id === action.payload.id) {
						return action.payload.modifiedMessage;
					}
					return i;
				}),
			};
			configs.messages = newState;
			break;

		// This one is for displaying all rooms in the chatlist.
		case 'chat/CREATE_CHAT':
			newState = {
				...state,
				[topic]: state[topic] || [],
			};
			configs.messages = newState;
			break;

		case 'chat/PUBLISH_MESSAGE':
		default:
			newState = state;
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
				newState = { error: true };
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
 */
const chatSettings = (state = {}, action) => {
	let newState, initial;
	const topic = action.payload?.topic;

	switch (action.type) {
		case 'chat/REMOVE':
			initial = { ...state };
			delete initial[topic];
			newState = initial;
			configs.chatSettings = newState;
			break;

		case 'chat/MARK_UNREAD':
			initial = state[topic]?.unread || [];
			newState = {
				...state,
				[topic]: {
					...state[topic],
					unread: [...initial, action.payload.message.id],
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
					...state[topic],
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
	messages,
	reactions,
	chatSettings,

	// UI
	draftMessage,
	navigation,
});
