import { genPrivateChatName, parseAddr, formatAddr } from 'Approot/misc/util';
import NKN from 'Approot/workers/nkn/nknHandler';
import uuidv4 from 'uuid/v4';

/**
 * Here lies the D-Chat NKN message schema.
 *
 * Some things:
 *  Topic is chatroom topic.
 *   Omit `topic` in whispers.
 *  Specify a unique ID so people can react to certain messages via `targetID`.
 *  `timestamp` from toUTCString.
 *
 * Example of a text message that is sent out:
 *
 * ```json
 * {
 *   contentType: 'text',
 *   content: 'some _markdown_ format text',
 *   id: '{123-321-3213-21435tr}', // uuidv4()
 *   topic: 'topic-name-without-hash',
 *   timestamp: ${new Date().toUTCString()},
 * }
 * ```
 *
 * Topic is omitted in whispers.
 * Media messages are the same except `contentType: 'media'`, -
 * the media is sent with `content: "![](base64datastring)".`
 * Reactions are `contentType: 'reaction'` and include `targetID`.
 *
 * Whispers had a field: `isPrivate: true` at some point, not sure why any more.
 * d-chat still adds it in `nkn/nkn.js: sendMessage`.
 *
 * There is also a contentType: 'dchat/subscribe', that is used when announcing -
 * joining the chat, and 'nkn/tip', that is used in tips.
 *
 * For messages that don't want user reaction, use `contentType: 'background'`.
 *
 * Rest of stuff is internal or old stuff, didn't have the presence of mind to underscore them.
 *
 * Do not treat messages as trusted content, see `IncomingMessage.js`.
 */
class Message {
	constructor(message) {
		const now = new Date().getTime();

		// TODO is.string() checks
		this.contentType = message.contentType || 'text';
		this.id = message.id || uuidv4();

		this.topic = message.topic;
		this.timestamp = message.timestamp || new Date().toUTCString();

		// This was used in tracking transactions, but that feature was nonsense,
		// and only implemented because transactions weren't free at one point.
		this.transactionID = message.transactionID;
		this.value = message.value;
		// Another message's ID.
		// Useful for reactions, tips, etc. Anything you use on a specific message.
		this.targetID = message.targetID;
		if (message.timestamp) {
			this.ping = now - new Date(this.timestamp).getTime();
		} else {
			this.ping = 0;
		}
	}

	/**
	 * Adds sender information to message.
	 *
	 * opts has `overrideTopic` to override topics.
	 * Othewise you will send a message to `/whisper/your_addr`, when -
	 * you want `/whisper/their_addr`.
	 */
	from(src, opts = {}) {
		if (src === 'me') {
			src = NKN.instance.addr;
		}

		if (src === NKN.instance.addr) {
			this.isMe = true;
		}

		// So why is topic set here and not the constructor?
		// Well, sending whispers, it's to omit topic, rather than to -
		// use /whisper/recipient_addr at send time.
		if (this.topic == null) {
			this.topic = opts.overrideTopic || genPrivateChatName(src);
		}

		const [name, pubKey] = parseAddr(src);
		this.addr = src;
		this.username = name;
		this.pubKey = pubKey;
		this.refersToMe = this.content?.includes(formatAddr(NKN.instance.addr));

		return this;
	}
}

export default Message;
