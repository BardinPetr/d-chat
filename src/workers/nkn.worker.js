import NKN from './nkn/nknHandler';
import { PayloadType } from 'nkn-client';
import Message from 'Approot/background/Message';
import {
	getAddressFromAddr,
} from 'Approot/misc/util';
import {
	setLoginStatus,
	receiveMessage,
	setSubscribers,
	connected,
	getBalance,
} from 'Approot/redux/actions';
import {
	switchedToClient,
	setBalance,
	createNewClient,
	switchToClient,
} from 'Approot/redux/actions/client';

export const log = (...args) => {
	console.log('d-chat: worker:', args);
};

onmessage = ({ data: action }) => {
	const payload = action.payload;
	console.log('from worker:', action);

	let status, client, topic, message;
	// postMessage works like dispatch.
	switch (action.type) {
		case 'nkn/SWITCH_TO_CLIENT_ALIAS':
			client = NKN.activateClient(payload.address);
			addNKNListeners(client);
			postMessage(switchedToClient(client));
			break;

		case 'nkn/NEW_CLIENT_ALIAS':
			client = NKN.createClient(payload.username);
			postMessage(createNewClient(client));
			postMessage(switchToClient(client.wallet.Address));
			break;

		case 'nkn/IMPORT_WALLETSEED':
			client = NKN.importClient(payload.walletSeed, payload.username);
			postMessage(createNewClient(client));
			postMessage(switchToClient(client.wallet.Address, payload.username));
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
			NKN.instance.subscribe(topic).catch(err => {
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

function addNKNListeners (client) {
	const dispatch = postMessage;

	client.on('connect', async () => {
		dispatch(connected());
		dispatch(getBalance());
		log('connected');
	});

	client.on('message', (...args) => {
		log('Received message:', ...args);
		handleIncomingMessage(...args);
	});

	// Pending value transfers handler.
	client.on('block', async () => {
		dispatch(getBalance());
	});
}

function handleIncomingMessage(src, payload, payloadType) {
	if ( payloadType === PayloadType.TEXT ) {
		const data = JSON.parse(payload);
		const message = new Message(data, {
			from: src,
		});

		// message = message.from(src);
		postMessage(receiveMessage(message));
	}
}
