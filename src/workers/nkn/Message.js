import {
	genPrivateChatName,
	parseAddr,
	formatAddr,
} from 'Approot/misc/util';
import NKN from 'Approot/workers/nkn/nknHandler';
import uuidv1 from 'uuid/v1';

/**
 * Here lies the D-Chat NKN message schema.
 *
 * Some things:
 *  Topic is chatroom topic. Might change it to topicHash in the future, to improve privacy (topic can't be overheard by listeners, then).
 *   Omit `topic` in whispers.
 *  Specify a unique ID so people can react to certain messages via `targetID`.
 *  Mark messages sent with `nknClient.send()` as private with `isPrivate = true`;
 *  `transactionID` should be set for tips, so client will get confirmation.
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

		this.topic = message.topic;
		this.timestamp = message.timestamp || new Date().toUTCString();

		this.transactionID = message.transactionID;
		// Another message's ID.
		// Useful for reactions, tips, etc. Anything you use on a specific message.
		this.targetID = message.targetID;
		this.isPrivate = Boolean(message.isPrivate);
		this.value = message.value;
		if (message.timestamp) {
			this.ping = now - new Date(this.timestamp).getTime();
		} else {
			this.ping = 0;
		}

		if (message.isWhisper) {
			this.topic = undefined;
		}
	}

	from(src, opts = {}) {
		if (src === 'me') {
			src = NKN.instance.addr;
			// Locally received.
			if (this.isPrivate && this.topic == null) {
				this.topic = genPrivateChatName(opts.toChat || '');
			}
		} else  if (this.isPrivate && this.topic == null) {
			this.topic = genPrivateChatName(src);
		}

		if ( src === NKN.instance.addr ) {
			this.isMe = true;
		}

		const [ name, pubKey ] = parseAddr(src);
		this.addr = src;
		// Includes dot if identifier exists.
		this.username = name;
		this.pubKey = pubKey;
		this.refersToMe = this.content && this.content.includes(
			formatAddr( NKN.instance.addr )
		);

		return this;
	}

}

export default Message;
