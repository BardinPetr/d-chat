import NKN from './nknHandler';
import Message from 'Approot/background/Message';
import {
	log,
	getAddressFromAddr,
	__,
	getChatDisplayName,
} from 'Approot/misc/util';
import {
	setLoginStatus,
	receiveMessage,
	setSubscribers,
} from 'Approot/redux/actions';
import {
	switchedToClient,
	setBalance,
} from 'Approot/redux/actions/client';

onmessage = ({ data: action }) => {
	const payload = action.payload;

	let status, client, topic, message;
	// postMessage works like dispatch.
	switch (action.type) {
		case 'nkn/SWITCH_TO_CLIENT_ALIAS':
			client = NKN.activateClient(payload.address);
			// TODO addNKNListeners
			break;

		case 'nkn/NEW_CLIENT_ALIAS':
			break;

		case 'nkn/IMPORT_WALLET_ALIAS':
			break;

		case 'LOGIN_ALIAS':
			try {
				client = NKN.start(action.payload.credentials);
				postMessage(switchedToClient(client));
				log('logged in');
				status = { addr: client.addr };
			} catch (e) {
				log('Failed login.', e);
				status = { error: true };
			}
			postMessage(setLoginStatus(status));
			break;

		case 'LOGOUT_ALIAS':
			NKN.clear();
			postMessage({ type: 'LOGOUT' });
			break;

		case 'chat/PUBLISH_MESSAGE_ALIAS':
			NKN.instance.publishMessage(payload.to, payload.message);
			break;

		case 'chat/SEND_PRIVATE_MESSAGE_ALIAS':
			NKN.instance.sendMessage(payload.to, payload.message);
			message = message.from('me');
			postMessage(receiveMessage(message));
			break;

		case 'nkn/NEW_TRANSACTION_ALIAS':
			NKN.instance.wallet.transferTo(
				getAddressFromAddr(payload.to),
				payload.value
			).then(() => {
				const message = new Message({
					contentType: 'nkn/tip',
					value: payload.value,
					content: payload.content,
				});

				NKN.instance.sendMessage(
					payload.to,
					message
				);
			});
			break;

		case 'nkn/SUBSCRIBE':
			topic = payload.topic;
			NKN.instance.subscribe(topic).then(() => {
				const message = new Message({
					topic,
					contentType: 'dchat/subscribe',
					content: __('Re/subscribed to') + ' ' + getChatDisplayName(topic) + '.',
					isPrivate: true,
				});
				postMessage(receiveMessage(message));
			}).catch(err => {
				if (err.data?.includes('funds')) {
					const message = new Message({
						topic,
						contentType: 'dchat/subscribe',
						content: __('Insufficient funds to subscribe. Send a message so someone can tip you. You will not see the message because you are not subscribed yet, so no panic.'),
					});
					postMessage(receiveMessage(message));
				}
				log('Errored at subscribe. Already subscribed?', err);
			});
			break;

		case 'chat/GET_SUBSCRIBERS_ALIAS':
			topic = payload.topic;
			NKN.instance.getSubs(topic).then(({ subscribers, subscribersInTxPool }) => {
				subscribers = subscribers.concat(subscribersInTxPool);
				postMessage(setSubscribers(topic, subscribers));
			});
			break;

		case 'nkn/GET_BALANCE_ALIAS':
			if (!NKN.instance) {
				return;
			}
			NKN.instance.getBalance().then(balance => postMessage(
				setBalance(payload.address, balance)
			));
			break;

		default:
			console.log('Unknown thingy in worker:', action, payload);
	}
};

// TODO maybe dispatch block() ?
function addNKNListeners (dispatch) {
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

		// const transactions = getState().transactions;
		// const pendingTransactions = transactions.unconfirmed.map(i => i.transactionID);
		// log('New block!!!', block, transactions);

		// for ( let pendingTx of pendingTransactions ) {
		// 	if ( block.transactions.find(tx => pendingTx === tx.hash ) ) {
		// 		log('Transaction complete!');
		// 		dispatch(transactionComplete(pendingTx));
		// 	}
		// }
	});
};

