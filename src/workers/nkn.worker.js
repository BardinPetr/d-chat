import NKN from 'Approot/workers/nkn/nknHandler';
import OutgoingMessage from 'Approot/workers/nkn/OutgoingMessage';
import IncomingMessage from 'Approot/workers/nkn/IncomingMessage';
import {
	getAddressFromAddr,
	genPrivateChatName,
	isWhisper,
} from 'Approot/misc/util';
import receiveMessage from 'Approot/workers/nkn/messageReceiver';
import {
	setLoginStatus,
	setSubscribers,
	setSubscriptionInfos,
	sendPrivateMessage,
	publishMessage,
} from 'Approot/redux/actions';
import {
	setBalance,
	activateClient,
} from 'Approot/redux/actions/client';

onmessage = async ({ data: action }) => {
	const payload = action.payload;

	let status, client, topic, message, data;
	// postMessage works like dispatch.
	switch (action.type) {
		case 'LOGIN_ALIAS':
			try {
				client = NKN.start({
					...action.payload.credentials,
					wallet: action.payload.wallet,
					seed: action.payload.seed,
				});
				postMessage(activateClient(
					client.neutered(),
				));
				status = { addr: client.addr };
			} catch (e) {
				console.log('Failed login.', e);
				status = { error: e.message || 'Error' };
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

			// Receive it locally and overwrite id so, when we -
			// receive it again, it will be ignored.
			data = new IncomingMessage(payload.message);
			data.id = message.id;
			data.from('me');

			// Will display message as greyed out. Removed once it is received.
			data.isNotConfirmed = true;
			receiveMessage(data);
			break;

		case 'SEND_PRIVATE_MESSAGE_ALIAS':
			// Send it out.
			message = new OutgoingMessage(payload.message);
			NKN.instance.sendMessage(payload.recipient, message, payload.options);

			// Receive it locally.
			data = new IncomingMessage(payload.message);
			data.id = message.id;
			data = data.from('me', {
				overrideTopic: genPrivateChatName(payload.recipient),
			});
			receiveMessage(data);
			break;

		// TODO may want some "insufficient funds" check in place.
		case 'nkn/NEW_TRANSACTION_ALIAS':
			data = await NKN.instance.wallet
				.transferTo(getAddressFromAddr(payload.recipient), payload.value)
				.catch(() => {
					return false;
				});

			if (data !== false) {
				message = new OutgoingMessage({
					contentType: 'reaction',
					content: payload.content,
					topic: payload.topic,
					targetID: payload.targetID,
				});

				if (isWhisper(message)) {
					postMessage(sendPrivateMessage(message));
				} else {
					postMessage(publishMessage(message));
				}
			}
			break;

		case 'SUBSCRIBE_TO_CHAT_ALIAS':
			topic = payload.topic;
			data = await NKN.instance
				.subscribe(topic, {
					metadata: action.payload.options.metadata,
					fee: action.payload.options.fee,
				}).catch(() => false);

			if (data !== false) {
				data = new OutgoingMessage({
					contentType: 'dchat/subscribe',
					topic,
					// No i18n here.
					content: 'Joined channel.',
				});
				NKN.instance.publishMessage(topic, data);
			}
			break;

		case 'chat/GET_SUBSCRIBERS_ALIAS':
			topic = payload.topic;
			NKN.instance
				.getSubs(topic)
				.then(({ subscribers, subscribersInTxPool }) => {
					subscribers = subscribers.concat(subscribersInTxPool);
					postMessage(setSubscribers(topic, subscribers));
				});
			break;

		case 'nkn/GET_BALANCE_ALIAS':
			if (!NKN.instance) {
				return;
			}
			NKN.instance.wallet
				.getBalance()
				.then(balance => postMessage(setBalance(payload.address, balance)));
			break;

		case 'chat/FETCH_SUBSCRIPTION_INFOS_ALIAS':
			topic = payload.topic;
			data = await NKN.instance.fetchSubscriptions(topic);
			postMessage(setSubscriptionInfos(topic, data));
			break;

		default:
			console.log('Unknown thingy in worker:', action, payload);
	}
};

onerror = e => console.error('NKN worker error:', e);
onmessageerror = e => console.error('NKN worker messageerror:', e);
