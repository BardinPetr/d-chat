import NKN from 'Approot/workers/nkn/nknHandler';
import OutgoingMessage from 'Approot/workers/nkn/OutgoingMessage';
import IncomingMessage from 'Approot/workers/nkn/IncomingMessage';
import {
	getAddressFromAddr,
	genPrivateChatName,
	isWhisper,
	isWhisperTopic,
} from 'Approot/misc/util';
import {
	setLoginStatus,
	receiveMessage,
	setSubscribers,
	setSubscriptionInfos,
} from 'Approot/redux/actions';
import {
	switchedToClient,
	setBalance,
	createNewClient,
	switchToClient,
} from 'Approot/redux/actions/client';

// Receivin a lot of messages in short time causes UI to lag.
// It is probably because each message is transmitted to state separately.
// Might want to throttle receiveMessage and receive chunks of multiple messages.
// Or maybe deep diff between store and proxy store will fix it?

onmessage = async ({ data: action }) => {
	const payload = action.payload;

	let status, client, topic, message, data;
	// postMessage works like dispatch.
	switch (action.type) {
		case 'nkn/SWITCH_TO_CLIENT_ALIAS':
			client = NKN.activateClient(payload.address);
			postMessage(switchedToClient(client.wallet.address));
			break;

		case 'nkn/NEW_CLIENT_ALIAS':
			client = NKN.createClient(payload.username);
			postMessage(createNewClient(client.neutered()));
			postMessage(switchToClient(client.wallet.address));
			break;

		case 'nkn/IMPORT_WALLETSEED':
			client = NKN.importClient(payload.walletSeed, payload.username);
			postMessage(createNewClient(client.neutered()));
			postMessage(switchToClient(client.wallet.address, payload.username));
			break;

		case 'LOGIN_ALIAS':
			try {
				if (action.meta.clients.length > 0) {
					// Previously active.
					client = action.meta.clients.find(c => c.active);
				}
				client = NKN.start(
					{ ...action.payload.credentials, client },
					action.meta.clients,
				);
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
			NKN.instance.sendMessage(payload.recipient, message);

			// Receive it locally.
			data = new IncomingMessage(payload.message);
			data.id = message.id;
			data = data.from('me', {
				overrideTopic: genPrivateChatName(payload.recipient),
			});
			postMessage(receiveMessage(data));
			break;

		case 'nkn/NEW_TRANSACTION_ALIAS':
			await NKN.instance.wallet
				.transferTo(getAddressFromAddr(payload.to), payload.value);

			topic = isWhisperTopic(payload.topic)
				? undefined
				: topic;

			message = new OutgoingMessage({
				contentType: 'nkn/tip',
				value: payload.value,
				content: payload.content,
				topic,
			});

			if (isWhisper(message)) {
				NKN.instance.sendMessage(payload.to, message);
			} else {
				NKN.instance.publishMessage(topic, message);
			}

			message = new IncomingMessage({
				...message,
			}).from('me');
			postMessage(receiveMessage(message));
			break;

		case 'SUBSCRIBE_TO_CHAT_ALIAS':
			topic = payload.topic;
			await NKN.instance
				.subscribe(topic, {
					metadata: action.payload.options.metadata,
					fee: action.payload.options.fee,
				});

			data = new OutgoingMessage({
				contentType: 'dchat/subscribe',
				topic,
				// No i18n here.
				content: 'Joined channel.',
			});
			NKN.instance.publishMessage(topic, data);
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
