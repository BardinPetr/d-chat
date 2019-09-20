import nkn from 'nkn-multiclient';
import nknWallet from 'nkn-wallet';
import { genChatID } from 'Approot/misc/util';
import rpcCall from 'nkn-client/lib/rpc';

// TODO should move nkn stuff into a worker?

const FEE = 0.00000001; // 1 satoshi
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
	'http://mainnet-seed-0044.nkn.org:30003',
];
const getRandomSeed = () =>
	SEED_ADDRESSES[Math.floor(Math.random() * SEED_ADDRESSES.length)];

nknWallet.configure({
	rpcAddr: getRandomSeed(),
});

/**
 * Couple of helpers for nkn module.
 */
class NKN extends nkn {
	constructor({ wallet, username }) {
		// TODO : connection fail here will majorly break things.
		super({
			originalClient: true,
			identifier: username?.trim() || undefined,
			seed: wallet.getSeed(),
			seedRpcServerAddr: getRandomSeed(),
			msgHoldingSeconds: 3999999999,
		});

		this.wallet = wallet;
		this.on('message', console.log);
	}

	subscribe = async topic => {
		const topicID = genChatID(topic);
		const isSubbed = await this.isSubscribed(topic);
		if (!isSubbed) {
			return this.wallet.subscribe(topicID, FORBLOCKS, this.identifier, '', {
				fee: FEE,
			});
		}
	};

	isSubscribed = topic => {
		const topicID = genChatID(topic);
		const subInfo = this.defaultClient.getSubscription(topicID, this.addr);
		const latestBlockHeight = rpcCall(
			this.defaultClient.options.seedRpcServerAddr,
			'getlatestblockheight',
		);

		return Promise.all([subInfo, latestBlockHeight]).then(
			async ([info, blockHeight]) => {
				if (blockHeight === 0) {
					throw 'Block height 0.';
				}
				if (info.expiresAt - blockHeight > 5000) {
					return true;
				} else {
					return false;
				}
			}
		);
	}

	publishMessage = async (topic, message, options = { txPool: true }) => {
		console.log('Publishing message', message, 'to', topic, 'aka', genChatID(topic));
		try {
			return this.publish(genChatID(topic), JSON.stringify(message), options);
		} catch (e) {
			console.error('Error when publishing', e);
			throw e;
		}
	};

	sendMessage = async (to, message, options = {}) => {
		console.log('Sending private message', message, 'to', to);
		try {
			return this.send(to, JSON.stringify(message), options);
		} catch (e) {
			console.error('Error when sending', e);
			throw e;
		}
	};

	getSubs = (
		topic,
		options = {
			offset: 0,
			limit: 1000,
			meta: false,
			txPool: true,
		},
	) => {
		return this.defaultClient.getSubscribers(genChatID(topic), options);
	};

	toJSON() {
		return JSON.stringify(this.neutered());
	}

	neutered = () => {
		const w = JSON.parse(this.wallet.toJSON());
		w.address = w.Address;
		const c = {
			...this,
			wallet: w,
		};

		const preservedKeys = [ 'addr', 'identifier', 'wallet' ];
		for (let key in c) {
			preservedKeys.includes(key) || delete c[key];
		}
		return c;
	}
}

export default NKN;
