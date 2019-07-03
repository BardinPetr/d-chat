import nkn from	'nkn-client';
import nknWallet from	'nkn-wallet';
import configs from './configs';
import { genChatID } from './util';

const	BUCKET = 0;
// testnet - What does this even matter?
const FORBLOCKS = 50000;
const SEED_ADDRESSES = [
	'http://mainnet-seed-0001.nkn.org:30003',
	'http://mainnet-seed-0002.nkn.org:30003',
	'http://mainnet-seed-0003.nkn.org:30003',
	'http://mainnet-seed-0004.nkn.org:30003',
	'http://mainnet-seed-0005.nkn.org:30003',
	'http://mainnet-seed-0006.nkn.org:30003',
	'http://mainnet-seed-0007.nkn.org:30003',
	'http://mainnet-seed-0008.nkn.org:30003',
	'http://mainnet-seed-0009.nkn.org:30003',
	'http://mainnet-seed-0010.nkn.org:30003',
	'http://mainnet-seed-0011.nkn.org:30003',
	'http://mainnet-seed-0012.nkn.org:30003',
	'http://mainnet-seed-0013.nkn.org:30003',
	'http://mainnet-seed-0014.nkn.org:30003',
	'http://mainnet-seed-0015.nkn.org:30003',
	'http://mainnet-seed-0016.nkn.org:30003',
	'http://mainnet-seed-0017.nkn.org:30003',
	'http://mainnet-seed-0018.nkn.org:30003',
	'http://mainnet-seed-0019.nkn.org:30003',
	'http://mainnet-seed-0020.nkn.org:30003',
	'http://mainnet-seed-0021.nkn.org:30003',
	'http://mainnet-seed-0022.nkn.org:30003',
	'http://mainnet-seed-0023.nkn.org:30003',
	'http://mainnet-seed-0024.nkn.org:30003',
	'http://mainnet-seed-0025.nkn.org:30003',
	'http://mainnet-seed-0026.nkn.org:30003',
	'http://mainnet-seed-0027.nkn.org:30003',
	'http://mainnet-seed-0028.nkn.org:30003',
	'http://mainnet-seed-0029.nkn.org:30003',
	'http://mainnet-seed-0030.nkn.org:30003',
	'http://mainnet-seed-0031.nkn.org:30003',
	'http://mainnet-seed-0032.nkn.org:30003',
	'http://mainnet-seed-0033.nkn.org:30003',
	'http://mainnet-seed-0034.nkn.org:30003',
	'http://mainnet-seed-0035.nkn.org:30003',
	'http://mainnet-seed-0036.nkn.org:30003',
	'http://mainnet-seed-0037.nkn.org:30003',
	'http://mainnet-seed-0038.nkn.org:30003',
	'http://mainnet-seed-0039.nkn.org:30003',
	'http://mainnet-seed-0040.nkn.org:30003',
	'http://mainnet-seed-0041.nkn.org:30003',
	'http://mainnet-seed-0042.nkn.org:30003',
	'http://mainnet-seed-0043.nkn.org:30003',
	'http://mainnet-seed-0044.nkn.org:30003'
];

/**
 * Couple of helpers for nkn module.
 *
 * Saves walletJSON to sync storage.
 */
class	NKN	extends	nkn	{

	constructor({username, password})	{
		let wallet;
		const walletJSON = configs.walletJSON;
		const seed = SEED_ADDRESSES[ Math.floor( Math.random() * SEED_ADDRESSES.length ) ];

		if (walletJSON) {
			console.log('Loading existing wallet!');
			wallet = nknWallet.loadJsonWallet(walletJSON, password);

			if ( !wallet || !wallet.getPrivateKey ) {
				throw 'Invalid credentials';
			}
		} else {
			console.log('Creating new wallet.');
			wallet = nknWallet.newWallet(password);
			configs.walletJSON = wallet.toJSON();
		}
		console.log('Rpc seed address:', seed);
		super({
			identifier:	username.trim() || 'Pseudonymous',
			seed:	wallet.getSeed(),
			seedRpcServerAddr: seed,
		});
		this.wallet	=	wallet;
	}

	subscribe	=	topic	=> {
		console.log('Subscribing to', topic, 'aka', genChatID(topic), 'and this', this);
		return this.wallet.subscribe(
			genChatID( topic ),
			BUCKET,
			FORBLOCKS,
			this.identifier
		);
	}

	// I don't know	how	to override	functions	in react/babel.	Keeps	throwing errors. Traditional publish(){} doesn't work	either.
	// publish = (topicID, message)	=> {
	publishMessage = (topic, message)	=> {
		console.log('Publishing message', message,'to', topic, 'aka', genChatID( topic ));
		this.publish(
			genChatID( topic ),
			BUCKET,
			JSON.stringify(message),
			{ encrypt: false }
		);
	}

}

export default NKN;
