/**
 * Keeps track of active client and has startup logic.
 */
import { pb } from 'nkn-sdk';
import IncomingMessage from 'Approot/workers/nkn/IncomingMessage';
import NKN, { rpcServerAddr } from 'Approot/workers/nkn/nkn';
import { Wallet as NknWallet } from 'nkn-sdk';
import { createNewClient, getBalance } from 'Approot/redux/actions/client';
import { isNotice } from 'Approot/misc/util';
import {
	connected,
	receiveMessage,
} from 'Approot/redux/actions';

const { PayloadType } = pb.payloads;

function addNKNListeners (client) {

	client.onMessage(({ src, payload, payloadType }) => {
		handleIncomingMessage(src, payload, payloadType);
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

			const permitted = (
				isNotice(message)
				|| await client.Permissions.check(message.topic, src)
			);

			if (permitted && !message.unreceivable) {
				postMessage(receiveMessage(message));
			}
		}
	}
}

/**
 * Singleton.
 * This used to make sense, now it's redundant.
 */
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
			wallet = new NknWallet({
				seed,
				password,
				rpcServerAddr,
			});
		} else if (!isNewWallet) {
			const jsonString = wallet.toJSON?.() || JSON.stringify(wallet);
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
