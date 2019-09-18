class FakeNKN {
	constructor({ wallet, username }) {
		this.wallet = wallet;
		this.identifier = username;

		this.addr = (username ? username + '.' : '') + this.wallet.getPublicKey();
	}
	close() {}
}

export default FakeNKN;
