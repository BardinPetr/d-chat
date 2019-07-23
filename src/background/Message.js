import { getChatName, formatAddr } from 'Approot/misc/util';
import configs from 'Approot/misc/configs';
import { runtime, notifications } from 'webextension-polyfill';
import uuidv1 from 'uuid/v1';

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

	async notify() {
		if ( configs.showNotifications ) {
			return notifications.create( 'd-chat',
				{
					type: 'basic',
					message: this.content,
					title: 'D-Chat #' + this.topic + ', ' + this.username + ':',
					iconUrl: runtime.getURL('/img/icon2.png'),
				}
			);
		}
	}
}

export default Message;
