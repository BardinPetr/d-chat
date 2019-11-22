/**
 * Handles swapping between wallets, -
 * producing wallet details that can be stored, -
 * and parses incoming messages as well as decides what to do with them.
 *
 * All in all this thing is quite useless. Changing wallets after login is -
 * not that UX friendly. Instead, should give a dropdown of clients -
 * on login screen. 'Import wallet' button there would make better sense -
 * there, too.
 */
import { PayloadType } from 'nkn-client';
import IncomingMessage from 'Approot/workers/nkn/IncomingMessage';
import NKN from 'Approot/workers/nkn/nkn';
import FakeNKN from 'Approot/workers/nkn/FakeNKN';
import nknWallet from 'nkn-wallet';
import { createNewClient } from 'Approot/redux/actions/client';
import {
	connected,
	getBalance,
	receiveMessage,
} from 'Approot/redux/actions';

function addNKNListeners (client) {

	client.on('message', (...args) => {
		handleIncomingMessage(...args);
		// Do not send ack-messages.
		return false;
	});

	client.on('connect', async () => {
		postMessage(connected());
		postMessage(getBalance(client.wallet.address));
	});
}

async function handleIncomingMessage(src, payload, payloadType) {
	if ( payloadType === PayloadType.TEXT ) {
		const data = JSON.parse(payload);
		const message = new IncomingMessage(data).from(src);

		if (!message.unreceivable) {
			postMessage(receiveMessage(message));
		}
	}
}

/**
 * #instance is the active client.
 * Only one client is active at a time, otherwise -
 * messages would come flooding in as duplicates.
 *
 * #clients is list of clients, loaded from extension storage at first, -
 * and stored there.
 *
 * There is a bug where changing client name doesn't reflect in status.
 */
class NKNHandler {
	// Static private.
	static #instance;
	static #password;
	static #clients;

	static get instance() {
		return this.#instance;
	}
	static clear() {
		if (this.#instance) {
			this.#instance.close();
		}
		this.#instance = null;
		this.#password = null;
	}

	static start({ username, password, client }, clients) {
		if (this.#instance != null) {
			throw 'Already started! Use switchToClient?';
		}
		this.#clients = clients;

		let wallet, isNewWallet = client == null;

		if (client) {
			wallet = nknWallet.loadJsonWallet(JSON.stringify(client.wallet), password);

			if (!wallet || !wallet.getPrivateKey) {
				throw 'Invalid credentials.';
			}
		} else {
			wallet = nknWallet.newWallet(password);
			isNewWallet = true;
		}

		this.#password = password;

		const realClient = new NKN({
			username,
			wallet,
		});


		if (isNewWallet) {
			const c = realClient.neutered();
			postMessage(createNewClient(c));
			this.#clients = [...this.#clients, c];
		}

		this.#instance = realClient;

		addNKNListeners(realClient);

		return realClient;
	}

	// Activates client with specified wallet address. Messages will be sent from that client.
	static activateClient(address) {
		let client = this.#clients.find(
			client => client.wallet.Address === address,
		);
		if (client) {
			const walletJSON = JSON.stringify(client.wallet);
			const wallet = nknWallet.loadJsonWallet(walletJSON, this.#password);

			this.#instance.close();
			this.#instance = new NKN({
				username: client.identifier,
				wallet: wallet,
			});
			addNKNListeners(this.#instance);
		} else {
			throw 'No such client.';
		}

		const c = this.#instance.neutered();
		this.#clients = this.#clients.map(client =>
			client.wallet.Address === address ? c : client,
		);
		return this.#instance;
	}

	static createClient(username) {
		// Let's make sure that password is the same.
		const wallet = nknWallet.newWallet(this.#password);

		const client = new FakeNKN({ username, wallet });

		this.#clients = [...this.#clients, client.neutered()];

		return client;
	}

	static importClient(walletSeed, username) {
		// Change password.
		const wallet = nknWallet.restoreWalletBySeed(walletSeed, this.#password);
		const client = new FakeNKN({
			username,
			wallet,
		});

		this.#clients = [...this.#clients, client.neutered()];

		return client;
	}
}

export default NKNHandler;
