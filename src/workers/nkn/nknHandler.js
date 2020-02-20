/**
 * Keeps track of active client and has startup logic.
 */
import { PayloadType } from 'nkn-client';
import IncomingMessage from 'Approot/workers/nkn/IncomingMessage';
import NKN from 'Approot/workers/nkn/nkn';
import nknWallet from 'nkn-wallet';
import { createNewClient, getBalance } from 'Approot/redux/actions/client';
import { isNotice } from 'Approot/misc/util';
import {
	connected,
	receiveMessage,
} from 'Approot/redux/actions';

function addNKNListeners (client) {

	client.on('ordered-message', async (...args) => {
		handleIncomingMessage(...args);
	});
	// Do not send ack-messages.
	client.on('message', () => false);

	client.on('connect', async () => {
		postMessage(connected());
		postMessage(getBalance(client.wallet.address));
	});

	async function handleIncomingMessage(src, payload, payloadType) {
		if (payloadType === PayloadType.TEXT) {
			const data = payload;
			const message = new IncomingMessage(data).from(src);

			const permitted =
				isNotice(message) || await client.Permissions.check(message.topic, src);

			if (permitted && !message.unreceivable) {
				postMessage(receiveMessage(message));
				// receiveMessage(message);
			}
		}
	}
}

// Singleton.
class NKNHandler {
	// Static private.
	static #instance;

	static get instance() {
		return this.#instance;
	}

	static clear() {
		this.#instance?.close();
		this.#instance = null;
	}

	static start({ username, password, wallet, seed }) {
		const isNewWallet = !wallet;

		if (seed) {
			wallet = nknWallet.restoreWalletBySeed(seed, password);
		} else if (!isNewWallet) {
			wallet = nknWallet.loadJsonWallet(JSON.stringify(wallet), password);
			if (!wallet || !wallet.getPrivateKey) {
				throw 'Invalid credentials.';
			}
		} else {
			wallet = nknWallet.newWallet(password);
		}

		const realClient = new NKN({
			username,
			wallet,
		});

		if (isNewWallet) {
			const c = realClient.neutered();
			postMessage(createNewClient(c));
		}
		addNKNListeners(realClient);

		this.#instance?.close();

		this.#instance = realClient;

		return realClient;
	}
}

export default NKNHandler;
