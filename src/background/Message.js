import {
	genPrivateChatName,
	createNotification,
	getChatDisplayName,
	formatAddr,
	parseAddr,
	log,
} from 'Approot/misc/util';
import { 	createTransaction, receiveMessage, markUnread } from 'Approot/redux/actions';
import { extension } from 'webextension-polyfill';
import uuidv1 from 'uuid/v1';

/**
 * Here lies the D-Chat NKN message schema.
 *
 * Some things:
 *  Topic is chatroom topic. Might change it to topicHash in the future, to improve privacy (topic can't be overheard by listeners, then).
 *   Omit `topic` in whispers.
 *  Specify a unique ID so people can react to certain messages via `targetID`.
 *  Mark messages sent with `nknClient.send()` as private with `isPrivate = true`;
 *  `transactionID` should be set for tips, so client will get confirmation message.
 *  `value` is value in satoshis.
 *  `timestamp` from toUTCString.
 * Rest of stuff is practically internal, didn't have the presence of mind to underscore them.
 */
class Message {
	constructor(message) {
		const now = new Date().getTime();

		// TODO is.string() checks
		this.contentType = message.contentType || 'text';
		this.id = message.id || uuidv1();
		this.content = message.content || '';
		this.topic = message.topic;
		this.timestamp = message.timestamp || new Date().toUTCString();

		this.transactionID = message.transactionID;
		// A message's ID.
		// Useful for reactions, tips, etc. Anything you use on a specific message.
		this.targetID = message.targetID;
		this.isPrivate = Boolean(message.isPrivate);
		this.value = message.value;
		if (this.timestamp) {
			this.ping = now - new Date(this.timestamp).getTime();
		} else {
			this.ping = 0;
		}
	}

	from(src) {
		if (src === 'me') {
			src = window.nknClient.addr;
		} else if (this.isPrivate && this.topic == null) {
			log('Received private message', this, src);
			this.topic = genPrivateChatName(src);
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
		let title = this.title || `D-Chat ${getChatDisplayName(this.topic)}, ${this.username}.${this.pubKey.slice(0, 8)}:`;
		return createNotification({
			message: this.content,
			title: title,
		});
	}

	async whisper(to) {
		this.topic = undefined;
		return this.send(to);
	}

	async send(toAddr) {
		if ( toAddr === window.nknClient.addr ) {
			return;
		}

		// Let's delete some useless data before sending.
		this.isMe = undefined;
		this.addr = undefined;
		this.pubKey = undefined;
		this.refersToMe = undefined;
		this.username = undefined;
		this.title = undefined;
		this.notified = undefined;
		this.isPrivate = true;

		let options;
		if (this.contentType === 'nkn/tip') {
			options = {
				msgHoldingSeconds: 0,
			};
		}

		const sendingMessage = await window.nknClient.sendMessage(toAddr, this, options);

		return sendingMessage;
	}

	async publish(topic) {
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
				}
				this.notified = true;
				break;

			case 'reaction':
				// Omit notifications for reactions.
				this.notified = true;
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
