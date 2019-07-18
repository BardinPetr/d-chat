import { getChatName } from 'Approot/misc/util';
import configs from 'Approot/misc/configs';
import { runtime, browserAction, notifications } from 'webextension-polyfill';
import uuid from 'uuid';

let counter = 0, timeout;

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
		let splitPart = src.lastIndexOf('.');
		if ( splitPart !== -1 ) {
			this.username = src.slice(0, splitPart);
		}
		this.username = this.username || 'Pseudonymous';
		return this;
	}

	notify() {
		counter++;
		browserAction.getBadgeText({})
			.then(text => {
				let count;
				if ( !text ){
					count = counter;
				} else {
					count = +text + 1;
				}
				browserAction.setBadgeText({
					text: String(count)
				});

				// On startup, the numbers go all wrong. Attempted fix.
				if ( timeout ) {
					clearTimeout(timeout);
				}
				// Otherwise it will be zero.
				timeout = setTimeout(() => counter = 0, 100);

				if ( configs.showNotifications ) {
					notifications.create(
						'd-chat',
						{
							type: 'basic',
							message: this.content,
							title: 'D-Chat #' + this.topic + ', ' + this.username + ':',
							iconUrl: runtime.getURL('/img/icon2.png'),
						}
					);
				}
			});
	}
}

export default Message;
