import NKN from './nkn';
import FakeNKN from './FakeNKN';
import nknWallet from 'nkn-wallet';
import { createNewClient } from 'Approot/redux/actions/client';

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

	static start({ username, password }, clients) {
		if (this.#instance != null) {
			throw 'Already started! Why call this twice?';
		}
		let wallet, isNewWallet;
		const walletJSON = clients.find(c => c.active);

		if (walletJSON) {
			wallet = nknWallet.loadJsonWallet(walletJSON, password);

			if (!wallet || !wallet.getPrivateKey) {
				throw 'Invalid credentials.';
			}
		} else {
			wallet = nknWallet.newWallet(password);
			isNewWallet = true;
		}

		this.#password = password;

		const targetClient = clients.some(
			storedClient => storedClient.wallet.Address === wallet.address,
		);

		if (targetClient) {
			// Use existing username.
			username = targetClient.identifier;
		}

		const client = new FakeNKN({
			username,
			wallet,
		});

		if (isNewWallet) {
			postMessage(createNewClient(client));
		}

		if (!targetClient) {
			// New client? Add to list. This only happens the first time.
			const c = this.parseClient(client);
			this.#clients = [...clients, c];
		}

		this.#instance = client;

		return client;
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
		} else {
			throw 'No such client.';
		}

		const c = this.parseClient(this.#instance);
		this.#clients = this.#clients.map(client =>
			client.wallet.Address === address ? c : client,
		);
		return c;
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
