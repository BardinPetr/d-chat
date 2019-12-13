import {
	createChat,
	subscribeToChat,
} from '../actions';
import passworder from 'browser-passworder';

// TODO maybe remove auto-login?
const password = 'd-chat!!!';

const delegateToWorker = originalAction => (dispatch, getState) => {
	if (!originalAction.meta?.WebWorker) {
		const wallet = originalAction.type === 'LOGIN_ALIAS'
			&& getState().clients.find(c =>
				c.wallet.Address === originalAction.payload.address
			)?.wallet;

		dispatch({
			...originalAction,

			payload: {
				wallet,
				...originalAction.payload,
			},

			meta: {
				...originalAction.meta,
				WebWorker: true,
			},

		});
	} else {
		return;
	}

	let credentials;
	switch (originalAction.type) {
		case 'LOGOUT_ALIAS':
			localStorage.clear();
			break;

		case 'LOGIN_ALIAS':
			credentials = originalAction.payload.credentials;
			if (credentials.rememberMe) {
				passworder.encrypt(password, credentials)
					.then(blob =>
						localStorage.setItem('credentials', JSON.stringify(blob))
					);
			}
			break;
	}
};

const joinChat = originalAction => dispatch => {
	const topic = originalAction.payload.topic;
	if (topic) {
		dispatch(createChat(topic));
		dispatch(subscribeToChat(topic));
	}
};

export default {
	'PUBLISH_MESSAGE_ALIAS': delegateToWorker,
	'LOGIN_ALIAS': delegateToWorker,
	'chat/GET_SUBSCRIBERS_ALIAS': delegateToWorker,
	'LOGOUT_ALIAS': delegateToWorker,
	'nkn/GET_BALANCE_ALIAS': delegateToWorker,
	'nkn/NEW_TRANSACTION_ALIAS': delegateToWorker,
	'SUBSCRIBE_TO_CHAT_ALIAS': delegateToWorker,
	'SEND_PRIVATE_MESSAGE_ALIAS': delegateToWorker,
	'chat/MAYBE_OFFER_SUBSCRIBE_ALIAS': delegateToWorker,
	'chat/FETCH_SUBSCRIPTION_INFOS_ALIAS': delegateToWorker,

	'JOIN_CHAT_ALIAS': joinChat,
};
