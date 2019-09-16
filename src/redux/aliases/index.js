import NKN from 'Approot/background/nknHandler';
import {
	transactionComplete,
	connected,
	receivingMessage,
	getBalance,
	getUnreadMessages,
} from '../actions';
import passworder from 'browser-passworder';
import {
	setBadgeText,
	log,
} from 'Approot/misc/util';

// TODO move to own file
const password = 'd-chat!!!';

const addNKNListeners = async (dispatch, getState) => {
	const client = NKN.instance;

	client.on('connect', async () => {
		dispatch(connected());
		dispatch(getBalance());
		log('connected');
	});

	client.on('message', (...args) => {
		log('Received message:', ...args);
		dispatch(receivingMessage(...args));
	});

	// Pending value transfers handler.
	client.on('block', async block => {
		dispatch(getBalance());

		const transactions = getState().transactions;
		const pendingTransactions = transactions.unconfirmed.map(i => i.transactionID);
		log('New block!!!', block, transactions);

		for ( let pendingTx of pendingTransactions ) {
			if ( block.transactions.find(tx => pendingTx === tx.hash ) ) {
				log('Transaction complete!');
				dispatch(transactionComplete(pendingTx));
			}
		}
	});
};

// const newClientHandler = originalAction => dispatch => {
// 	const { username } = originalAction.payload;

// 	try {
// 		const client = NKN.createClient(username);
// 		log('Created client:', client);
// 		dispatch(createNewClient(client));
// 		dispatch(switchToClient(client.wallet.Address));
// 	} catch (e) {
// 		originalAction.payload.error = __('Wrong password.');
// 	}
// 	return originalAction;
// };

// const switchToClientHandler = originalAction => (dispatch, getState) => {
// 	const { address } = originalAction.payload;

// 	log('Switching to client:', address);
// 	try {
// 		const client = NKN.activateClient(address);
// 		addNKNListeners(dispatch, getState);
// 		log('Switching to client:', client);

// 		dispatch({
// 			type: 'nkn/SWITCH_TO_CLIENT',
// 			payload: {
// 				client
// 			},
// 		});
// 	} catch(e) {
// 		originalAction.payload.error = __('Wrong password.');
// 	}
// 	return originalAction;
// };

// Import and activate.
// const walletImport = originalAction => (dispatch, getState) => {
// 	const existingWallets = getState().clients.map(c => c.wallet.Address);
// 	const { walletJSON, username, password } = originalAction.payload;
// 	if (existingWallets.includes(walletJSON.Address)) {
// 		originalAction.payload.error = __('This wallet is already imported.');
// 		return originalAction;
// 	}

// 	try {
// 		log('About to import:', walletJSON, password, username);
// 		const client = NKN.importClient(JSON.stringify(walletJSON), password, username);
// 		dispatch(createNewClient(client));
// 		dispatch(switchToClient(client.wallet.Address, username, password));
// 	} catch (e) {
// 		originalAction.payload.error = __('Wrong password.');
// 	}
// 	return originalAction;
// };

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

const delegateToWorker = originalAction => (dispatch) => {
	dispatch({
		...originalAction,
		meta: {
			...originalAction.meta,
			WebWorker: true,
		}
	});

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
	'nkn/IMPORT_WALLET_ALIAS': delegateToWorker,

	'chat/MARK_READ_ALIAS': markRead,
};
