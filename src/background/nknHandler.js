import NKN from './nkn';
import configs from 'Approot/misc/configs';
import nknWallet from 'nkn-wallet';
import { log } from 'Approot/misc/util';

class NKNHandler {
	// Static private.
	static #instance;
	static #password;

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

	static start({ username, password }) {
		if (this.#instance != null) {
			throw 'Already started! Why call this twice?';
		}
		let wallet;
		const walletJSON = configs.walletJSON;

		if (walletJSON) {
			log('Loading existing wallet!');
			wallet = nknWallet.loadJsonWallet(walletJSON, password);

			if (!wallet || !wallet.getPrivateKey) {
				throw 'Invalid credentials.';
			}
		} else {
			log('Creating new wallet.');
			wallet = nknWallet.newWallet(password);
			configs.walletJSON = wallet.toJSON();
		}

		this.#password = password;

		const targetClient = configs.clients.some(
			storedClient => storedClient.wallet.Address === wallet.address,
		);

		if (targetClient) {
			// Use existing username.
			username = targetClient.identifier;
		}

		const client = new NKN({
			username,
			wallet,
		});

		if (!targetClient) {
			// New client? Add to list. This only happens the first time.
			const c = this.parseClient(client);
			configs.clients = [...configs.clients, c];
		}

		this.#instance = client;

		return client;
	}

	// Activates client with specified wallet address. Messages will be sent from that client.
	static activateClient(address) {
		let client = configs.clients.find(
			client => client.wallet.Address === address,
		);
		if (client) {
			const walletJSON = JSON.stringify(client.wallet);
			const wallet = nknWallet.loadJsonWallet(walletJSON, this.#password);

			this.#instance.close();
			client = new NKN({
				username: client.identifier,
				wallet: wallet,
			});
			this.#instance = client;
		} else {
			throw 'No such client.';
		}

		const c = this.parseClient(client);
		configs.clients = configs.clients.map(client =>
			client.wallet.Address === address ? c : client,
		);
		return c;
	}

	static createClient(username) {
		// Let's make sure that password is the same.
		const wallet = nknWallet.newWallet(this.#password);

		const client = new NKN({ username, wallet });
		client.close();

		const c = this.parseClient(client);
		configs.clients = [...configs.clients, c];

		return c;
	}

	static importClient(walletJSON, password = this.#password, username) {
		// Change password.
		let wallet = nknWallet.loadJsonWallet(walletJSON, password);
		wallet = nknWallet.restoreWalletBySeed(wallet.getSeed(), this.#password);
		const client = new NKN({
			username,
			wallet,
		});
		client.close();

		const c = this.parseClient(client);
		configs.clients = [...configs.clients, c];

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
