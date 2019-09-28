import NKN from 'Approot/workers/nkn/nknHandler';
import OutgoingMessage from 'Approot/workers/nkn/OutgoingMessage';
import IncomingMessage from 'Approot/workers/nkn/IncomingMessage';
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

// TODO figure i18n for this. Can't from tl from web worker.
// Receivin a lot of messages in short time causes UI to lag.
// It is probably because each message is transmitted to state separately.
// Might want to throttle receiveMessage and receive chunks of multiple messages.
// Or maybe deep diff between store and proxy store will fix it?

onmessage = async ({ data: action }) => {
	const payload = action.payload;

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
			postMessage(switchToClient(client.wallet.address));
			break;

		case 'nkn/IMPORT_WALLETSEED':
			client = NKN.importClient(payload.walletSeed, payload.username);
			postMessage(createNewClient( client.neutered() ));
			postMessage(switchToClient(client.wallet.address, payload.username));
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
			message = new OutgoingMessage(payload.message);
			NKN.instance.publishMessage(payload.topic, message);
			break;

		case 'SEND_PRIVATE_MESSAGE_ALIAS':
			// Send it out.
			message = new OutgoingMessage(payload.message);
			NKN.instance.sendMessage(payload.recipient, message);
			// Receive it locally.
			message = new IncomingMessage(payload.message);
			message = message.from('me', { toChat: payload.recipient });
			postMessage(receiveMessage(message));
			break;

		case 'nkn/NEW_TRANSACTION_ALIAS':
			NKN.instance.wallet.transferTo(
				getAddressFromAddr(payload.to),
				payload.value
			).then(() => {
				const message = new OutgoingMessage({
					contentType: 'nkn/tip',
					value: payload.value,
					content: payload.content,
					topic: payload.topic,
					isPrivate: true,
				});

				NKN.instance.sendMessage(
					payload.to,
					message
				);

				const incMessage = new IncomingMessage({
					contentType: 'nkn/tip',
					value: payload.value,
					content: `Tipped ${payload.to} ${payload.value?.toFixed?.(8)} NKN.`,
					isMe: true,
					topic: payload.topic,
					isPrivate: true,
				});
				postMessage(receiveMessage(incMessage));
			}).catch(console.error);
			break;

		case 'SUBSCRIBE_TO_CHAT_ALIAS':
			topic = payload.topic;
			NKN.instance.subscribe(topic).then(() => {
				message = new IncomingMessage({
					contentType: 'dchat/subscribe',
					topic,
					isPrivate: true,
					// TODO i18n
					content: 'Subscribed.',
				});
				postMessage(receiveMessage(message));
			}).catch(err => {
				if (err.code === 1 || err.msg?.data?.includes('funds')) {
					message = new IncomingMessage({
						contentType: 'dchat/subscribe',
						topic,
						isPrivate: true,
						// TODO i18n
						content: 'Insufficient funds. Send a message and ask for a tip.\nOnce you have been tipped, you need to wait a moment for the transaction to confirm, and then click subscribe again.',
					});
					postMessage(receiveMessage(message));
				}
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

		case 'chat/MAYBE_OFFER_SUBSCRIBE_ALIAS':
			topic = payload.topic;
			status = await NKN.instance.isSubscribed(topic);
			if (!status) {
				message = new IncomingMessage({
					contentType: 'dchat/offerSubscribe',
					topic,
					isPrivate: true,
				});
				postMessage(receiveMessage(message));
			}
			break;

		default:
			console.log('Unknown thingy in worker:', action, payload);
	}
};
