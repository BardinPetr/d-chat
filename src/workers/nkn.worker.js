import NKN from 'Approot/workers/nkn/nknHandler';
import Message from 'Approot/workers/nkn/Message';
import {
	getAddressFromAddr,
} from 'Approot/misc/util';
import {
	setLoginStatus,
	receiveMessage,
	setSubscribers,
} from 'Approot/redux/actions';
import {
	switchedToClient,
	setBalance,
	createNewClient,
	switchToClient,
} from 'Approot/redux/actions/client';

onmessage = ({ data: action }) => {
	const payload = action.payload;
	console.log('from worker:', action);

	let status, client, topic, message;
	// postMessage works like dispatch.
	switch (action.type) {
		case 'nkn/SWITCH_TO_CLIENT_ALIAS':
			client = NKN.activateClient(payload.address);
			postMessage(switchedToClient( client.wallet.address ));
			break;

		case 'nkn/NEW_CLIENT_ALIAS':
			client = NKN.createClient(payload.username);
			postMessage(createNewClient( client.neutered() ));
			postMessage(switchToClient(client.wallet.Address));
			break;

		case 'nkn/IMPORT_WALLETSEED':
			client = NKN.importClient(payload.walletSeed, payload.username);
			postMessage(createNewClient( client.neutered() ));
			postMessage(switchToClient(client.wallet.Address, payload.username));
			break;

		case 'LOGIN_ALIAS':
			try {
				if (action.meta.clients.length > 0) {
					// Previously active.
					client = action.meta.clients.find(c => c.active);
				}
				client = NKN.start({...action.payload.credentials, client}, action.meta.clients);
				status = { addr: client.addr };
			} catch (e) {
				console.log('Failed login.', e);
				status = { error: true };
			}
			postMessage(setLoginStatus(status));
			break;

		case 'LOGOUT_ALIAS':
			NKN.clear();
			postMessage({ type: 'LOGOUT' });
			break;

		case 'PUBLISH_MESSAGE_ALIAS':
			console.log('PUBLISHING!!!', payload.message);
			NKN.instance.publishMessage(payload.topic, payload.message);
			break;

		case 'SEND_PRIVATE_MESSAGE_ALIAS':
			NKN.instance.sendMessage(payload.recipient, payload.message);
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

		case 'SUBSCRIBE_TO_CHAT_ALIAS':
			topic = payload.topic;
			console.log('huh?', topic, NKN.instance);
			NKN.instance.subscribe(topic).catch(err => {
				console.log('Errored at subscribe. Already subscribed?', err);
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
			NKN.instance.wallet.getBalance().then(balance =>
				postMessage( setBalance(payload.address, balance) )
			);
			break;

		default:
			console.log('Unknown thingy in worker:', action, payload);
	}
};
