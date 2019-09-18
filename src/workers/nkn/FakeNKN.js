class FakeNKN {
	constructor({ wallet, username }) {
		this.wallet = wallet;
		this.identifier = username;

		this.addr = (username ? username + '.' : '') + this.wallet.getPublicKey();

		// Cannot postMessage the wallet without turning it to JSON first, so this mocks.
		this.stringified = {
			identifier: this.identifier,
			wallet: JSON.parse(wallet.toJSON()),
			addr: this.addr,
		};
	}
	close() {}
}

export default FakeNKN;
