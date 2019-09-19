class FakeNKN {
	constructor({ wallet, username }) {
		this.wallet = wallet;
		this.identifier = username;

		this.addr = (username ? username + '.' : '') + this.wallet.getPublicKey();

		// Cannot postMessage the wallet without turning it to JSON first, so this mocks.
		const w = JSON.parse(wallet.toJSON());
		w.address = w.Address;
		this.stringified = {
			identifier: this.identifier,
			wallet: w,
			addr: this.addr,
		};
	}
	close() {}
	neutered() {
		return this.stringified;
	}
}

export default FakeNKN;
