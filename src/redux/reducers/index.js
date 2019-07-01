import { combineReducers } from 'redux';
// Sayonara, true pure functions.
import configs from '../../misc/configs';

const messages = (state = configs.messages, action ) => {
	// console.log('is anybody out there? these messages are killing me', state, action);
	let newState;
	let initial;
	switch (action.type) {
		case 'RECEIVE_MESSAGE':
			initial = state[action.payload.topic] || [];
			newState = {
				...state,
				[action.payload.topic]: [ ...initial, action.payload.message ]
			};
			break;

		// This one is for displaying all rooms in the chatlist.
		case 'CREATE_CHAT':
			newState = {
				...state,
				[action.payload.topic]: []
			};
			break;

		case 'PUBLISH_MESSAGE':
		default:
			newState = state;
	}
	return newState;
};

const subscriptions = ( state = {}, action ) => {
	// console.log('is anybody out there?');
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
	console.log('subscribing...', newState, state, action);
	return newState;
};

const login = (state = {}, action) => {
	// console.log('is anybody out there?, login calling', action);
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

		default:
			newState = state;
	}
	// console.log('login', newState, state, action);
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
	// console.log('is anybody out there? this is enter chat calling', newState, state, payload);
	return newState;
};

export default combineReducers({
	login,
	subscriptions,
	topic,
	messages
});
