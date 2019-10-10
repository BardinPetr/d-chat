import nkn from 'nkn-multiclient';
import nknWallet from 'nkn-wallet';
import { genChatID, DCHAT_PUBLIC_TOPICS } from 'Approot/misc/util';
import rpcCall from 'nkn-client/lib/rpc';

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
	// 'http://mainnet-seed-0017.nkn.org:30003',
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
	}

	subscribe = async (topic, options = {}) => {
		const metadata = options.metadata;
		const topicID = genChatID(topic);
		const isSubbed = await this.isSubscribed(topic);

		if (isSubbed && topic !== DCHAT_PUBLIC_TOPICS) {
			return;
		}

		const fee = options.fee || 0;

		return this.wallet.subscribe(
			topicID,
			FORBLOCKS,
			this.identifier,
			JSON.stringify(metadata),
			{
				fee,
			},
		);
	};

	/**
	 * There is no "memPool: true" argument for this one.
	 * First isSubscribed. Then, if not subscribed, get subs from tx pool, check if in there.
	 */
	isSubscribed = topic => {
		const topicID = genChatID(topic);
		const subInfo = this.defaultClient.getSubscription(topicID, this.addr);
		const latestBlockHeight = rpcCall(
			this.defaultClient.options.seedRpcServerAddr,
			'getlatestblockheight',
		);
		const subs = this.getSubs(topic);

		return Promise.all([subInfo, latestBlockHeight, subs]).then(
			async ([info, blockHeight, subs]) => {
				if (blockHeight === 0) {
					throw 'Block height 0.';
				}
				if (
					info.expiresAt - blockHeight > 5000 ||
					subs.subscribersInTxPool.some(sub => sub === this.addr)
				) {
					return info;
				} else {
					return false;
				}
			},
		);
	};

	publishMessage = async (topic, message, options = {}) => {
		options = {
			txPool: true,
			...options,
		};
		try {
			return this.publish(genChatID(topic), JSON.stringify(message), options);
		} catch (e) {
			console.error('Error when publishing', e);
			throw e;
		}
	};

	sendMessage = async (to, message, options = {}) => {
		if (to === this.addr) {
			return;
		}
		try {
			return this.send(to, JSON.stringify(message), options);
		} catch (e) {
			console.error('Error when sending', e);
			throw e;
		}
	};

	getSubs = (topic, options = {}) => {
		options = {
			offset: 0,
			limit: 1000,
			meta: false,
			txPool: true,
			...options,
		};
		topic = genChatID(topic);
		return this.defaultClient.getSubscribers(topic, options);
	};

	/**
	 * Gets subscription metadata for all subscribers in a channel.
	 *
	 * @return [{user, data}]
	 */
	fetchSubscriptions = async topic => {
		const subs = await this.getSubs(topic, {
			meta: true,
		});

		const promises = [];

		const data = Object.entries(subs.subscribers).reduce((acc, sub) => {
			let subscriberData;
			if (sub[1] && typeof sub[1] === 'string' && sub[1] !== '') {
				try {
					subscriberData = JSON.parse(sub[1]);
				} catch (e) {
					return acc;
				}
			} else {
				return acc;
			}

			// If this is for the list of public chats, then get sub counts.
			if (topic === DCHAT_PUBLIC_TOPICS && subscriberData.name) {
				promises.push(
					this.defaultClient
						.getSubscribersCount(genChatID(subscriberData.name))
						.then(count => {
							subscriberData.subscribersCount = count;
						})
						.catch(console.error),
				);
			}

			subscriberData._user = sub[0];
			return acc.concat(subscriberData);
		}, []);

		await Promise.all(promises);

		return data;
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

		const preservedKeys = ['addr', 'identifier', 'wallet'];
		for (let key in c) {
			preservedKeys.includes(key) || delete c[key];
		}
		return c;
	};
}

export default NKN;
