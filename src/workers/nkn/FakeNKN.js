/**
 * Is a simple placeholder for an NKN (nkn.js) object.
 *
 * There is no option for creating an nkn-client without connecting it, so this is to get around that.
 */
import { getAddrFromAddress } from 'Approot/misc/util';

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

	static constructFromString(walletJSONString) {
		const parsed = JSON.parse(walletJSONString);
		parsed.address = parsed.Address;
		const addr = getAddrFromAddress(parsed.Address);

		const fake = {
			wallet: walletJSONString,
			identifier: '',
			addr,
			address: parsed.Address,
			stringified: {
				identifier: '',
				wallet: parsed,
				addr,
			},
		};

		return fake;
	}
}

export default FakeNKN;
export const clientFromWalletString = FakeNKN.constructFromString;
