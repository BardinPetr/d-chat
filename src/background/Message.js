import { formatAddr, parseAddr } from 'Approot/misc/util';
import configs from 'Approot/misc/configs';
import { runtime, notifications } from 'webextension-polyfill';
import uuidv1 from 'uuid/v1';

class Message {
	constructor(message) {
		const now = new Date().getTime();

		this.type = message.contentType || 'message/text';
		this.id = message.id || uuidv1();
		this.content = '';
		this.topic = message.topic || '';
		this.timestamp = message.timestamp || new Date().toUTCString();

		switch ( message.type ) {
			case 'nkn/tip':
				this.isPrivate = message.isPrivate;
				break;


			case 'nkn/beg':
				this.content = 'is BEGGING for a tip';
				break;

			case 'message/text':
			default:
				this.content = String(message.content) || '';
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
