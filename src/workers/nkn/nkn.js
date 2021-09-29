import { MultiClient } from 'nkn-sdk';
import { genChatID, DCHAT_PUBLIC_TOPICS, guessLatestBlockHeight } from 'Approot/misc/util';
import permissionsMixin from 'nkn-permissioned-pubsub/mixin';
import { isPermissionedTopic } from 'nkn-permissioned-pubsub/util';

import SigWorker from 'nkn-sdk/lib/worker/webpack.worker.js';
const createWorker = () => new SigWorker();

const FORBLOCKS = 400000;
// Resub if less than 20k blocks (~5 days) are left before subscription ends.
const RESUB_HEIGHT = 20 * 1000;

const PROTOCOL = location?.protocol === 'https:' ? 'https:' : 'http:';

const SEED_ADDRESSES = PROTOCOL === 'https:'
	? ['https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet']
	: [
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
export const rpcServerAddr = getRandomSeed();

/**
 * Everything NKN related.
 */
class NKN extends permissionsMixin(MultiClient) {
	constructor({ wallet, username }) {
		super({
			originalClient: true,
			identifier: username?.trim() || undefined,
			seed: wallet.getSeed(),
			rpcServerAddr,
			msgHoldingSeconds: 3999999999,
			tls: PROTOCOL === 'https:',
			worker: createWorker,
			responseTimeout: 0,
		});

		this.wallet = wallet;
	}

	async unsubscribe (
		topic,
		{ identifier = this.identifier, ...opts } = {}
	) {
		const topicID = genChatID(topic);
		return super.unsubscribe(topicID, identifier, opts);
	}

	// getNonce = () => this.getNonce();

	// Only one suscription per address in mempool at a time.
	// That means that changing channels rapidly keeps re-subbing,
	// which explains the "Joined channel." spam that happens.
	async subscribe (
		topic,
		{ settingPermissions, identifier = this.identifier, metadata, ...options } = {}
	) {
		const topicID = genChatID(topic);
		let isSubbed;
		if (!settingPermissions) {
			isSubbed = await this.isSubscribed(topic);
		}

		// Always resub the public topic list when we're adding our thing.
		if (isSubbed && topic !== DCHAT_PUBLIC_TOPICS) {
			throw 'Too soon';
		}

		return super.subscribe(
			topicID,
			FORBLOCKS,
			identifier,
			JSON.stringify(metadata),
			options
		);
	}

	getSubscription(topic, addr = this.addr){
		return super.getSubscription(genChatID(topic), addr);
	}

	async isSubscribed (topic, addr = this.addr) {
		const info = await this.getSubscription(topic, addr);
		const blockHeight = guessLatestBlockHeight();

		if (info.expiresAt - blockHeight > RESUB_HEIGHT) {
			return info;
		}
		return false;
	}

	async publishMessage (topic, message, options = {}) {
		options = {
			txPool: true,
			noReply: true,
			...options,
		};

		if (isPermissionedTopic(topic)) {
			const subs = await this.Permissions.getSubscribers(topic);
			return this.sendMessage(subs, message);
		} else {
			return super.publish(genChatID(topic), JSON.stringify(message), options).catch(() => {});
		}
	}

	async sendMessage (to, message, options = {}) {
		options = {
			noReply: true,
			...options
		};
		if (to === this.addr) {
			return;
		}

		return super.send(to, JSON.stringify(message), options).catch(() => {});
	}

	getSubscribers (topic, options = {}) {
		options = {
			offset: 0,
			limit: 1000,
			meta: false,
			txPool: true,
			...options,
		};
		topic = genChatID(topic);
		return super.getSubscribers(topic, options);
	}

	/**
	 * Gets subscription metadata for all subscribers in a channel.
	 *
	 * @return [{user, data}]
	 */
	async fetchSubscriptions (topic) {
		const subs = await this.getSubscribers(topic, {
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
					super.getSubscribersCount(genChatID(subscriberData.name))
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
	}

	toJSON() {
		return this.neutered();
	}

	/**
	 * Returns a version that is fine to store, -
	 * it contains no sensitive information.
	 */
	neutered () {
		const w = JSON.parse(JSON.stringify(this.wallet));
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
	}
}

export default NKN;
