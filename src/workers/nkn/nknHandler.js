/**
 * Keeps track of active client and has startup logic.
 */
import { pb } from 'nkn-sdk';
import IncomingMessage from 'Approot/workers/nkn/IncomingMessage';
import NKN, { rpcServerAddr } from 'Approot/workers/nkn/nkn';
import { Wallet as NknWallet } from 'nkn-sdk';
import { createNewClient, getBalance } from 'Approot/redux/actions/client';
import {
	connected,
	receiveMessage,
} from 'Approot/redux/actions';
import {
	receiveContact
} from 'Approot/redux/actions/contacts';
import {
	isWhisper,
	isContact,
} from 'Approot/misc/util';

const { PayloadType } = pb.payloads;

function addNKNListeners (client) {

	client.onMessage(({ src, payload, payloadType }) => {
		handleIncomingMessage(src, payload, payloadType).catch(console.warn);
		// Do not send ack-messages.
		return false;
	});

	client.onConnect(() => {
		IncomingMessage.onConnect();
		postMessage(connected());
		postMessage(getBalance(client.wallet.address));
	});

	async function handleIncomingMessage(src, payload, payloadType) {
		if (payloadType === PayloadType.TEXT) {
			const data = JSON.parse(payload);
			const message = new IncomingMessage(data).from(src);

			// Let's ignore messages that come without permissions.
			const check = isWhisper(message) || await client.Permissions.check(message.topic, src);
			if (!check) {
				message.hidden = true;
				message.ignored = true;
			}

			// This got messy.
			// If it's not a chat message, then we don't want it in our messages database.
			if (isContact(message)) {
				postMessage(receiveContact(NKN.instance.addr, message));
			} else {
				// Assume it's chat message.
				// Could be one of 'text', 'media', 'reaction', 'event:subscribe',....etc.
				postMessage(receiveMessage(message));
			}
		}
	}
}

let instance;
/**
 * Singleton.
 * This used to make sense, now it's redundant.
 */
class NKNHandler {

	static get instance() {
		return instance;
	}

	static clear() {
		instance?.close();
		instance = null;
	}

	static start({ username, password, wallet, seed }) {
		const isNewWallet = !wallet;

		if (seed) {
			wallet = new NknWallet({
				seed,
				password,
				rpcServerAddr,
			});
		} else if (!isNewWallet) {
			const jsonString = JSON.stringify(wallet);
			wallet = NknWallet.fromJSON(
				jsonString,
				{
					password,
					rpcServerAddr,
				}
			);
			if (!wallet || !wallet.getPublicKey) {
				throw 'Invalid credentials.';
			}
		} else {
			wallet = new NknWallet({
				password,
				rpcServerAddr,
			});
		}

		const realClient = new NKN({
			username,
			wallet,
		});

		if (isNewWallet) {
			const c = JSON.stringify(realClient);
			postMessage(createNewClient(c));
		}
		addNKNListeners(realClient);

		instance?.close();

		instance = realClient;

		return realClient;
	}
}

export default NKNHandler;
