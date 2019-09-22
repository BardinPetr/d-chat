import { combineReducers } from 'redux';
// Sayonara, true pure functions.
import configs from '../../misc/configs';
import clients from './client';
import { isNotice } from 'Approot/misc/util';

const replaceMessage = (from, whatId, withWhat) =>
	from.reduce((acc, item) => {
		if (whatId === item.id) {
			if (withWhat) {
				return acc.concat(withWhat);
			} else {
				return acc;
			}
		}
		return acc.concat(item);
	}, []);

const reactions = (state = configs.reactions, action) => {
	let newState, initial, targetID;
	const topic = action.payload?.topic;

	switch (action.type) {
		case 'chat/RECEIVE_REACTION':
			targetID = action.payload.message.targetID;
			if (!targetID) {
				return state;
			} else {
				initial = state[topic]?.[targetID] || [];
			}
			if (initial.some(msg => msg.id === action.payload.message.id)) {
				return state;
			}
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

		case 'chat/MODIFY_REACTION':
		default:
			newState = state;
	}
	return newState;
};

const messages = (state = {}, action) => {
	let newState, initial;
	const topic = action.payload?.topic;

	switch (action.type) {
		case 'chat/REMOVE':
			newState = {
				...state,
				[topic]: state[topic]?.slice(-10) || [],
			};
			configs.messages = newState;
			break;

		case 'chat/RECEIVE_MESSAGE':
			// First add new msg to state, for displaying.
			initial = state[topic] || [];
			// Already exists, or we're spamming "not subscribed" messages.
			if (initial.some(msg => msg.id === action.payload.message.id) ||
					(isNotice(action.payload.message) &&
				initial[initial.length - 1]?.contentType === action.payload.message.contentType)
			) {
				return state;
			}
			newState = {
				...state,
				[topic]: [...initial, action.payload.message],
			};
			// Then add to storage.
			initial = configs.messages[topic] || [];
			initial = {
				...configs.messages,
				[topic]: [...initial, action.payload.message],
			};
			configs.messages = initial;
			break;

		// This one is for displaying all rooms in the chatlist.
		case 'chat/CREATE_CHAT':
			newState = {
				...state,
				[topic]: state[topic] || [],
			};
			break;

		case 'chat/MODIFY_MESSAGE':
			initial = state[topic];
			newState = {
				...state,
				[topic]: replaceMessage(
					initial,
					action.payload.id,
					action.payload.message,
				),
			};
			break;

		case 'chat/GET_MESSAGES':
			initial = configs.messages[topic]?.slice(-(action.payload.howMany)) || [];
			newState = {
				...state,
				[topic]: initial,
			};
			break;

		case 'chat/PUBLISH_MESSAGE':
		default:
			newState = state;
	}
	return newState;
};

const transactions = (
	state = {
		unconfirmed: [],
		confirmed: configs.transactions.confirmed,
	},
	action,
) => {
	let newState, removed, initial;

	switch (action.type) {
		case 'nkn/CREATE_TRANSACTION':
			// Sending tx to yourself makes it dupe, but whatever.
			newState = {
				...state,
				unconfirmed: [...state.unconfirmed, action.payload],
			};
			break;

		case 'nkn/TRANSACTION_COMPLETE':
			initial = [...state.unconfirmed];
			removed = initial.splice(
				state.unconfirmed.findIndex(
					i => i.transactionID === action.payload.transactionID,
				),
				1,
			);
			newState = {
				unconfirmed: [...initial],
				confirmed: [...state.confirmed.concat(removed)],
			};
			configs.transactions.confirmed = newState.confirmed;
			break;

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
const chatSettings = (state = configs.chatSettings, action) => {
	let newState, initial;
	const topic = action.payload?.topic;

	switch (action.type) {
		case 'chat/RECEIVE_MESSAGE':
			newState = {
				...state,
				[topic]: {
					...state[topic],
					messages: 1 + (state[topic]?.messages || 0),
				},
			};
			break;

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
					unread: [ ...initial, action.payload.message.id ],
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
					...state[topic],
					messages: configs.messages[topic]?.length || state[topic]?.messages || 0,
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
	draftMessage,
	chatSettings,
	transactions,
	// UI
	navigation,
});
