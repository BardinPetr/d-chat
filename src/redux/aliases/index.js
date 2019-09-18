import nknWallet from 'nkn-wallet';
import {
	getUnreadMessages,
} from '../actions';
import passworder from 'browser-passworder';
import {
	setBadgeText,
	__,
} from 'Approot/misc/browser-util';
import { importWalletSeed } from 'Approot/redux/actions/client';

// TODO maybe remove auto-login?
const password = 'd-chat!!!';

const walletImport = originalAction => (dispatch, getState) => {
	const existingWallets = getState().clients.map(c => c.wallet.Address);
	const { walletJSON, username, password } = originalAction.payload;
	if (existingWallets.includes(walletJSON.Address)) {
		originalAction.payload.error = __('This wallet is already imported.');
		return originalAction;
	}

	try {
		// Using seed to change password.
		const wallet = nknWallet.loadJsonWallet(JSON.stringify(walletJSON), password);
		const walletSeed = wallet.getSeed();

		// Worker will do the rest.
		dispatch(importWalletSeed({
			walletSeed,
			username,
		}));
	} catch (e) {
		originalAction.payload.error = __('Wrong password.');
	}
	return originalAction;
};

const markRead = originalAction => async (dispatch, getState) => {
	const ids = originalAction.payload.ids.length;
	if (ids > 0) {
		getUnreadMessages(getState()).then(count => setBadgeText( count - ids ));
	}

	return dispatch({
		type: 'chat/MARK_READ',
		payload: originalAction.payload,
	});
};

const delegateToWorker = originalAction => (dispatch, getState) => {
	if (!originalAction.meta?.WebWorker) {
		dispatch({
			...originalAction,
			meta: {
				...originalAction.meta,
				WebWorker: true,
				clients: getState().clientsMeta,
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
			if ( credentials.rememberMe ) {
				passworder.encrypt(password, credentials)
					.then(blob =>
						localStorage.setItem('credentials', JSON.stringify(blob))
					);
			}
			break;
	}
};

export default {
	'PUBLISH_MESSAGE_ALIAS': delegateToWorker,
	'LOGIN_ALIAS': delegateToWorker,
	'JOIN_CHAT_ALIAS': delegateToWorker,
	'chat/GET_SUBSCRIBERS_ALIAS': delegateToWorker,
	'LOGOUT_ALIAS': delegateToWorker,
	'GET_BALANCE_ALIAS': delegateToWorker,
	'nkn/NEW_TRANSACTION_ALIAS': delegateToWorker,
	'SUBSCRIBE_TO_CHAT_ALIAS': delegateToWorker,
	'SEND_PRIVATE_MESSAGE_ALIAS': delegateToWorker,
	'nkn/NEW_CLIENT_ALIAS': delegateToWorker,
	'nkn/SWITCH_TO_CLIENT_ALIAS': delegateToWorker,
	'nkn/IMPORT_WALLETSEED': delegateToWorker,

	'nkn/IMPORT_WALLET_ALIAS': walletImport,

	'chat/MARK_READ_ALIAS': markRead,
};
