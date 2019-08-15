import { combineReducers } from 'redux';
// Sayonara, true pure functions.
import configs from '../../misc/configs';

const messages = (state = configs.messages, action ) => {
	let newState;
	let initial;
	switch (action.type) {
		case 'RECEIVE_MESSAGE':
			initial = state[action.payload.topic] || [];
			newState = {
				...state,
				[action.payload.topic]: [ ...initial, action.payload.message ]
			};
			configs.messages = newState;
			break;

		// This one is for displaying all rooms in the chatlist.
		case 'CREATE_CHAT':
			newState = {
				...state,
				[action.payload.topic]: state[action.payload.topic] || []
			};
			configs.messages = newState;
			break;

		case 'PUBLISH_MESSAGE':
		default:
			newState = state;
	}
	return newState;
};

const subscribers = (state = [], action) => {
	let newState;
	switch (action.type) {
		case 'SET_SUBSCRIBERS':
			newState = [ ...action.payload.subscribers ];
			break;

		case 'GET_SUBSCRIBERS':
		default:
			newState = [ ...state ];
	}
	return newState;
};

const subscriptions = ( state = {}, action ) => {
	let newState;
	switch ( action.type ) {
		case 'SUBSCRIBE':
			newState = {
				...state,
				[action.payload.topic]: action.payload.transactionID
			};
			break;

		case 'SUBSCRIBE_COMPLETED':
			newState = { ...state };
			delete newState[action.payload.topic];
			break;

		default:
			newState = state;
	}
	return newState;
};

const transactions = (state = { unconfirmed: [], confirmed: [] }, action) => {
	let newState, removed;
	switch (action.type) {
		case 'nkn/NEW_TRANSACTION':
			newState = {
				...state,
				unconfirmed: [...state.unconfirmed, {
					id: action.payload.transactionID,
					data: action.payload.data,
				}],
			};
			break;

		case 'nkn/TRANSACTION_COMPLETE':
			removed = state.unconfirmed.splice(
				state.unconfirmed.findIndex(i => i.id === action.payload.transactionID),
				1
			);
			newState = {
				unconfirmed: [...state.unconfirmed],
				confirmed: [...state.confirmed.concat(removed)],
			};
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

		// There is something wrong with the .then in loginbox, in webext-redux.
		// It does not resolve the correct value.
		// Compare addr to null (in loginbox.js) is my workaround.
		case 'LOGIN_STATUS':
			if ( action.error ) {
				newState = { error: true };
			} else {
				newState = action.payload;
			}
			break;

		case 'CONNECTED':
			newState = {
				...state,
				connected: true
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

// Active topic handler.
const topic = (state = null, { type, payload }) => {
	let newState;
	switch (type) {
		case 'ENTER_CHAT':
			newState = payload.topic;
			break;

		// An alias, this one.
		case 'JOIN_CHAT':
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
 * Settings include:
 * - ...
 *
 * modify_read_count: Payload: { changes: { add, setTo } }
 */
const chatSettings = (state = configs.chatSettings, action) => {
	let newState, initial;
	switch (action.type) {
		case 'chat/TOGGLE_NOTIFICATIONS':
			break;

		case 'chat/MARK_UNREAD':
			initial = state[action.payload.topic]?.unread || [];
			newState = {
				...state,
				[action.payload.topic]: {
					...state[action.payload.topic],
					unread: [ ...initial, ...action.payload.ids ],
				},
			};
			configs.chatSettings = newState;
			break;

		case 'chat/MARK_READ':
			// Grab all unread messages.
			initial = state[action.payload.topic]?.unread || [];
			newState = {
				...state,
				[action.payload.topic]: {
					...state[action.payload.topic],
					// Filter out newly read message from unread messages.
					unread: initial.filter(i => !action.payload.ids.some(id => i === id) ),
				},
			};
			configs.chatSettings = newState;
			break;

		case 'CREATE_CHAT':
			newState = {
				...state,
				[action.payload.topic]: {
					...state[action.payload.topic],
					unread: [],
				}
			};
			break;

		default:
			newState = state;
	}
	return newState;
};

const nkn = (state = { balance: -1 }, action) => {
	let newState;
	switch (action.type) {
		case 'nkn/GET_BALANCE':
			newState = {
				...state,
				balance: action.payload.balance,
			};
			break;

		default:
			newState = state;
	}
	return newState;
};

export default combineReducers({
	login,
	// Client's ongoing subscriptions, waiting to be resolved.
	subscriptions,
	// Active chat.
	topic,
	messages,
	subscribers,
	draftMessage,
	chatSettings,
	// Information about wallet/client/so forth.
	nkn,
	transactions,
});