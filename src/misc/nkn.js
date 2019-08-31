import nkn from 'nkn-client';
import nknWallet from 'nkn-wallet';
import configs from './configs';
import { log, genChatID } from './util';

// TODO should move nkn stuff into a worker?

// TODO when it hits.
const FEE = 0.0000000; // 1; // 1 satoshi
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
class NKN extends nkn {

	constructor({username, password}) {
		let wallet;
		const walletJSON = configs.walletJSON;
		const seed = SEED_ADDRESSES[ Math.floor( Math.random() * SEED_ADDRESSES.length ) ];

		// TODO when it hits.
		nknWallet.configure({
			rpcAddr:'http://35.242.218.240:30003',
		});
		if (walletJSON) {
			log('Loading existing wallet!');
			wallet = nknWallet.loadJsonWallet(walletJSON, password);

			if ( !wallet || !wallet.getPrivateKey ) {
				throw 'Invalid credentials.';
			}
		} else {
			log('Creating new wallet.');
			wallet = nknWallet.newWallet(password);
			configs.walletJSON = wallet.toJSON();
		}
		log('Rpc seed address:', seed);

		// TODO : connection fail here will majorly break things.
		super({
			originalClient: true,
			identifier: username.trim() || undefined,
			seed: wallet.getSeed(),
			// TODO when it hits.
			seedRpcServerAddr: 'http://35.242.218.240:30003', // seed,
			msgHoldingSeconds: 3999999999,
		});

		this.wallet = wallet;
	}

	subscribe = async (topic) => {
		const topicID = genChatID( topic );
		const subInfo = await this.getSubscription(
			topicID,
			this.addr
		);

		// TODO......
		if ( !window.latestBlockHeight || subInfo.expiresAt - window.latestBlockHeight > 5000 ) {
			throw 'Too soon.';
		}

		log('Subscribing to', topic, 'aka', genChatID(topic), 'with fee', FEE, 'NKN', this);
		return this.wallet.subscribe(
			topicID,
			FORBLOCKS,
			this.identifier,
			'',
			{
				fee: FEE
			}
		);
	}

	publishMessage = async (topic, message, options = { txPool: true }) => {
		log('Publishing message', message,'to', topic, 'aka', genChatID( topic ));
		try {
			return this.publish(
				genChatID( topic ),
				JSON.stringify(message),
				options
			);
		} catch(e) {
			console.error('Error when publishing', e);
			throw e;
		}
	}

	sendMessage = async (to, message, options = {}) => {
		log('Sending private message', message, 'to', to);
		try {
			return this.send(
				to,
				JSON.stringify(message),
				options
			);
		} catch(e) {
			console.error('Error when sending', e);
			throw e;
		}
	}

	// TODO when it hits. recheck on this
	getSubs = (topic, options = {
		offset: 0,
		limit: 1000,
		meta: false,
		txPool: true,
	}) => {
		return this.getSubscribers(
			genChatID( topic ),
			options.offset,
			options.limit,
			options.meta,
			options.txPool,
		);
	}

}

export default NKN;
