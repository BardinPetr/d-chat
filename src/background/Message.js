import { getChatName, formatAddr } from 'Approot/misc/util';
import configs from 'Approot/misc/configs';
import { runtime, notifications } from 'webextension-polyfill';
import uuid from 'uuid';
import throttle from 'throttleit';

/**
 * Notifications are pretty resource intensive. Throttle them to 1 per 2 seconds.
 *
 * TODO maybe bottleneck instead and do "x and 5 messages".
 */
const throttledNotify = throttle(function() {
	notifications.create(
		'd-chat',
		{
			type: 'basic',
			message: this.content,
			title: 'D-Chat #' + this.topic + ', ' + this.username + ':',
			iconUrl: runtime.getURL('/img/icon2.png'),
		}
	);
}, 2000);

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
		this.id = uuid();
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

	notify() {
		if ( configs.showNotifications ) {
			throttledNotify.call(this);
		}
	}
}

export default Message;
