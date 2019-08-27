import { createNotification, getChatDisplayName, __, formatAddr, parseAddr } from 'Approot/misc/util';
import { receiveMessage, createTransaction, markUnread } from 'Approot/redux/actions';
import { extension } from 'webextension-polyfill';
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
		// A message's ID.
		// Useful for reactions, tips, etc. Anything you use on a specific message.
		this.targetID = message.targetID;
		this.isPrivate = Boolean(message.isPrivate);
		this.to = message.to;
		this.value = message.value || 1e-7; // The default WAS 10 sats. Can remove this soon (or set to -1);
		if (this.timestamp) {
			this.ping = now - new Date(this.timestamp).getTime();
		} else {
			this.ping = 0;
		}
	}

	from(src) {
		if (src === 'me') {
			src = window.nknClient.addr;
		}
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
		this.notified = true;
		if (this.contentType === 'nkn/tip') {
			if (this.to === window.nknClient.addr) {
				this.title = __('New incoming transaction in') + ': ' + getChatDisplayName(this.topic);
			} else if (this.addr === window.nknClient.addr) {
				this.title = __('New outgoing transaction in') + ': ' + getChatDisplayName(this.topic);
			} else {
				// Do not notify without reasonable title.
				return;
			}
		}

		let title = this.title || `D-Chat ${getChatDisplayName(this.topic)}, ${this.username}.${this.pubKey.slice(0, 8)}:`;
		return createNotification({
			message: this.content,
			title: title,
		});
	}

	send(toAddr) {
		// Let's delete some useless data before sending.
		this.isMe = undefined;
		this.addr = undefined;
		this.pubKey = undefined;
		this.refersToMe = undefined;
		this.username = undefined;
		this.title = undefined;
		this.targetID = undefined;
		this.notified = undefined;
		this.to = toAddr;
		this.isPrivate = true;
		let options;
		if (this.contentType === 'nkn/tip') {
			options = {
				msgHoldingSeconds: 0,
			};
		}
		return window.nknClient.sendMessage(toAddr, this, options);
	}

	publish(topic) {
		// Let's delete some useless data before sending.
		this.isMe = undefined;
		this.addr = undefined;
		this.pubKey = undefined;
		this.refersToMe = undefined;
		this.isPrivate = undefined;
		this.username = undefined;
		this.title = undefined;
		this.notified = undefined;
		return window.nknClient.publishMessage(topic, this);
	}

	async receive(dispatch) {
		switch (this.contentType) {
			case 'nkn/tip':
				if (this.isPrivate) {
					dispatch(
						createTransaction(this.transactionID, this)
					);
					this.notify();
				}
				break;

			case 'dchat/subscribe':
				this.isMe = true;
				break;
		}

		// Create notification?
		if ( !this.isMe && !this.notified ) {
			let views = extension.getViews({
				type: 'popup'
			});
			// Notify unless chat is open.
			if ( views.length === 0 ) {
				this.notify();

				// TODO Make this one work for all types of views.
				dispatch( markUnread(this.topic, [this.id]) );
			}
		}

		return dispatch(receiveMessage(this));
	}
}

export default Message;
