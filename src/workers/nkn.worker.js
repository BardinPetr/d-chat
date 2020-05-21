import NKN from 'Approot/workers/nkn/nknHandler';
import OutgoingMessage from 'Approot/workers/nkn/OutgoingMessage';
import IncomingMessage from 'Approot/workers/nkn/IncomingMessage';
import {
	getAddressFromAddr,
	getWhisperTopic,
	isWhisper,
} from 'Approot/misc/util';
import {
	setLoginStatus,
	setSubscribers,
	setSubscriptionInfos,
	sendPrivateMessage,
	publishMessage,
	receiveMessage,
} from 'Approot/redux/actions';
import {
	setBalance,
	activateClient,
} from 'Approot/redux/actions/client';
import {
	ContactRequest,
	ContactResponse,
} from 'Approot/workers/nkn/ContactRequest';

const notified = {};

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
				// Adding math.random at the end to make it more obvious,
				// that this _attempt_ failed.
				status = { error: (e.message || 'Error') + Math.random() };
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
			postMessage(receiveMessage(data));
			break;

		case 'SEND_PRIVATE_MESSAGE_ALIAS':
			// Send it out.
			message = new OutgoingMessage(payload.message);
			NKN.instance.sendMessage(payload.recipient, message, payload.options);

			// Receive it locally.
			data = new IncomingMessage(payload.message);
			data.id = message.id;
			data = data.from('me', {
				overrideTopic: getWhisperTopic(payload.recipient),
			});
			postMessage(receiveMessage(data));
			break;

		// TODO may want some "insufficient funds" check in place.
		case 'nkn/NEW_TRANSACTION_ALIAS':
			data = await NKN.instance.wallet
				.transferTo(getAddressFromAddr(payload.recipient), payload.value)
				.catch(() =>  false);

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
				.subscribe(topic, payload.options).catch(() => false);

			// Only yell out "Joined channel." once in a session.
			if (!notified[topic] && data !== false) {

				notified[topic] = true;

				data = new OutgoingMessage({
					contentType: 'event:subscribe',
					topic,
					// No i18n here.
					// TODO: remove this field
					content: 'Joined channel.',
				});
				postMessage(publishMessage(data));
			}
			break;

		case 'chat/UNSUBSCRIBE_ALIAS':
			topic = payload.topic;
			NKN.instance.unsubscribe(topic);
			break;

		case 'chat/GET_SUBSCRIBERS_ALIAS':
			topic = payload.topic;
			NKN.instance
				.Permissions.getSubscribers(topic)
				.then(subscribers => {
					postMessage(setSubscribers(topic, subscribers));
				});
			break;

		case 'nkn/GET_BALANCE_ALIAS':
			NKN.instance.wallet
				.getBalance()
				.then(balance => postMessage(setBalance(payload.address, balance)));
			break;

		case 'chat/FETCH_SUBSCRIPTION_INFOS_ALIAS':
			topic = payload.topic;
			data = await NKN.instance.fetchSubscriptions(topic);
			postMessage(setSubscriptionInfos(topic, data));
			break;

		case 'chat/ACCEPT_TO_CHATROOM_ALIAS':
			topic = payload.topic;
			NKN.instance.Permissions.accept(topic, payload.addr)
				.then(() => {
					const message = new OutgoingMessage({
						contentType: 'event:add-permission',
						topic,
						content: { addr: payload.addr },
					});
					postMessage(publishMessage(message));
				});
			break;

		case 'chat/REMOVE_ACCEPT_TO_CHATROOM_ALIAS':
			topic = payload.topic;
			NKN.instance.Permissions.remove(topic, payload.addr)
				.then(() => {
					const message = new OutgoingMessage({
						contentType: 'event:remove-permission',
						topic,
						content: { addr: payload.addr },
					});
					postMessage(publishMessage(message));
				});
			break;

		case 'contacts/REQUEST_CONTACT':
			data = new ContactRequest(payload.requestType);
			NKN.instance.sendMessage(payload.addr, data);
			break;

		case 'contacts/SEND_CONTACT_INFO':
			data = new ContactResponse(payload.contact);
			NKN.instance.sendMessage(payload.addr, data);
			break;

		default:
			console.log('Unknown thingy in worker:', action, payload);
	}
};

onerror = e => console.error('NKN worker error:', e);
onmessageerror = e => console.error('NKN worker messageerror:', e);
