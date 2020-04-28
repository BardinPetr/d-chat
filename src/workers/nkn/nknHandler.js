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
import { isWhisper } from 'Approot/misc/util';

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

			const permitted = (
				!message.unreceivable
			);
			// Let's ignore messages that come without permissions.
			const check = isWhisper(message) || await client.Permissions.check(message.topic, src);
			if (!check) {
				message.hidden = true;
				message.ignored = true;
			}

			if (permitted) {
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
