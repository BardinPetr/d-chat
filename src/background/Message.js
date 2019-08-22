import { __, formatAddr, parseAddr } from 'Approot/misc/util';
import configs from 'Approot/misc/configs';
import { runtime, notifications } from 'webextension-polyfill';
import uuidv1 from 'uuid/v1';

/**
 * Here lies the D-Chat NKN message schema.
 */
class Message {
	constructor(message) {
		const now = new Date().getTime();

		// TODO is.string() checks
		this.contentType = message.contentType || 'text';
		this.id = message.id || uuidv1();
		this.content = message.content || '';
		this.topic = message.topic || '';
		this.timestamp = message.timestamp || new Date().toUTCString();

		this.transactionID = message.transactionID;
		this.isPrivate = Boolean(message.isPrivate);
		this.value = message.value || 1e-7; // The default WAS 10 sats.
		if (this.contentType === 'nkn/tip' && !this.content) {
			this.content = __('Sent you') + ' ' + this.value.toFixed(8) + 'NKN';
		}

		if (this.timestamp) {
			this.ping = now - new Date(this.timestamp).getTime();
		} else {
			this.ping = 0;
		}
	}

	from(src) {
		if ( src === window.nknClient.addr ) {
			this.isMe = true;
		}
		const [ name, pubKey ] = parseAddr(src);
		this.addr = src;
		// Includes dot if identifier exists.
		this.username = name;
		this.pubKey = pubKey;
		this.refersToMe = this.content && this.content.includes(
			formatAddr( window.nknClient.addr )
		);
		return this;
	}

	async notify() {
		if ( configs.showNotifications ) {
			return notifications.create( 'd-chat',
				{
					type: 'basic',
					message: this.content,
					title: 'D-Chat #' + this.topic + ', ' + this.username + ':',
					iconUrl: runtime.getURL('/img/NKN_D-chat_blue-64cropped.png'),
				}
			);
		}
	}
}

export default Message;
