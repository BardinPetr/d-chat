import { combineReducers } from 'redux';
// Sayonara, true pure functions.
import configs from '../../misc/configs';

const messages = (state = [], action ) => {
	// console.log('is anybody out there?');
	let newState;
	switch (action.type) {
		case 'RECEIVE_MESSAGE':
			newState = [ action.payload, ...state ];
			break;

		case 'PUBLISH_MESSAGE':
		default:
			newState = state;
	}
	return newState;
};

const subscriptions = ( state = [], action ) => {
// 	console.log('is anybody out there?');
	let newState;
	switch ( action.type ) {
		case 'SUBSCRIBE':
			newState = [{
				topic: action.payload.topic,
				id: action.payload.subscriptionTxID
			}, ...state];
			break;

		case 'SUBSCRIBE_COMPLETED':
			newState = state.filter(i => i.topic !== action.payload.topic);
			break;

		default:
			newState = state;
	}
	return newState;
};

const chats = ( state = configs.chats, action ) => {
// 	console.log('is anybody out there?');
	let newState;
	switch ( action.type ) {
		case 'RECEIVE_MESSAGE':
			newState = {
				...state,
				[action.payload.topic]: {
					// XXX need this line or not?
					...state[action.payload.topic],
					messages: messages( state[action.payload.topic], action )
				}
			};
			break;

		case 'PUBLISH_MESSAGE': // TODO
		default:
			newState = state;
	}
	return newState;
};

const login = (state = {}, { type, payload }) => {
	// console.log('is anybody out there?');
	let newState;
	switch (type) {
		case 'LOGIN':
			newState = payload.credentials;
			break;

		case 'LOGIN_SUCCESS':
			newState = {
				...state,
				nkn: payload.nkn,
				addr: payload.addr
			};
			break;

		default:
			newState = state;
	}
	console.log('login', newState, state);
	return newState;
};

const activeChat = (state = {}, { type, payload }) => {
	let newState;
	switch (type) {
		case 'ENTER_CHAT':
			newState = {
				...state,
				topic: payload.topic
			};
			break;

		default:
			newState = state;
	}
	console.log('is anybody out there? this is enter chat calling', newState, state, payload);
	return newState;
};

export default combineReducers({
	chats,
	login,
	subscriptions,
	activeChat
});
