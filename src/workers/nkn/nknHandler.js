import { PayloadType } from 'nkn-client';
import Message from 'Approot/workers/nkn/Message';
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
	console.log('adding nkn listeners to:', client);
	const dispatch = postMessage;

	client.on('connect', async () => {
		dispatch(connected());
		dispatch(getBalance(client.wallet.address));
		console.log('connected');
	});

	client.on('message', (...args) => {
		console.log('Received message:', ...args);
		handleIncomingMessage(...args);
	});

	// Pending value transfers handler.
	client.on('block', async () => {
		console.log('NEW BLOCK');
		dispatch(getBalance());
	});
}

function handleIncomingMessage(src, payload, payloadType) {
	if ( payloadType === PayloadType.TEXT ) {
		const data = JSON.parse(payload);
		const message = new Message(data).from(src);

		postMessage(receiveMessage(message));
	}
}

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
			const c = this.parseClient(realClient);
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

		const c = this.parseClient(this.#instance);
		this.#clients = this.#clients.map(client =>
			client.wallet.Address === address ? c : client,
		);
		return this.#instance;
	}

	static createClient(username) {
		// Let's make sure that password is the same.
		const wallet = nknWallet.newWallet(this.#password);

		const client = new FakeNKN({ username, wallet });

		const c = this.parseClient(client);
		this.#clients = [...this.#clients, c];

		return c;
	}

	static importClient(walletSeed, username) {
		// Change password.
		const wallet = nknWallet.restoreWalletBySeed(walletSeed, this.#password);
		const client = new FakeNKN({
			username,
			wallet,
		});

		const c = this.parseClient(client);
		this.#clients = [...this.#clients, c];

		return c;
	}

	static parseClient(client) {
		const c = JSON.parse(JSON.stringify(client));
		// Wallet becomes double stringified. Undo.
		c.wallet = JSON.parse(c.wallet);
		return c;
	}
}

export default NKNHandler;
