import { getChatName, formatAddr } from 'Approot/misc/util';
import configs from 'Approot/misc/configs';
import { runtime, notifications } from 'webextension-polyfill';
import uuidv1 from 'uuid/v1';
import Bottleneck from 'bottleneck';

/**
 * Notifications are pretty resource intensive. Throttle them to 1 per 2 seconds.
 *
 * TODO maybe do "x and 5 messages".
 */
const limiter = new Bottleneck({
	strategy: Bottleneck.strategy.LEAK,
	highWater: 1,
	reservoir: 1,
	reservoirRefreshInterval: 2000,
	reservoirRefreshAmount: 1,
	maxConcurrent: 1,
	minTime: 2000,
});

class Message {
	constructor(message) {
		const now = new Date().getTime();
		Object.assign(this, message);
		this.topic = this.topic ? getChatName( this.topic ) : null;

		if (this.timestamp) {
			this.ping = now - new Date(this.timestamp).getTime();
		} else {
			this.ping = 0;
		}
		this.id = uuidv1();
	}

	from(src) {
		if ( src === window.nknClient.addr ) {
			this.isMe = true;
		}
		this.addr = src;
		this.username = formatAddr( src );
		this.refersToMe = this.content.includes( this.username );
		return this;
	}

	async _notify() {
		return await notifications.create(
			'd-chat',
			{
				type: 'basic',
				message: this.content,
				title: 'D-Chat #' + this.topic + ', ' + this.username + ':',
				iconUrl: runtime.getURL('/img/icon2.png'),
			}
		);
	}
	async notify() {
		if ( configs.showNotifications ) {
			limiter.schedule(() => this._notify.call(this))
				.catch(() => {});
		}
	}
}

export default Message;
