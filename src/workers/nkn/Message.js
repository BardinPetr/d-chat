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
 * `targetID` is like "reply to message that has this ID".
 *
 * Example of a text message that is sent out:
 *
 * ```json
 * {
 *   contentType: 'text',
 *   content: 'some _markdown_ format text',
 *   id: '{123-321-3213-21435tr}', // uuidv4(). Do not use uuidv1, because it will create duplicates.
 *   topic: 'topic-name-without-hash',
 *   timestamp: ${new Date().toUTCString()},
 * }
 * ```
 *
 * Topic is omitted in whispers, and `isPrivate: true` is added.
 * Media messages are the same except `contentType: 'media'`, -
 * the media is sent with `content: "![](base64datastring)".`
 * Reactions are `contentType: 'reaction'` and include `targetID`.
 *
 * Whispers have field `isPrivate: true` set so that, -
 * in the future, you can whisper to people inside a topic, -
 * and it would not create a new private chatroom, but just display -
 * the message in the topic chatroom. It is not used in d-chat for anything, -
 * and is mostly optional for now.
 * D-Chat adds it in nkn/nkn.js: `sendMessage()`.
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
		this.content = message.content;

		// Handling receipts as reactions.
		if (this.contentType === 'receipt') {
			this.contentType = 'reaction';
			// Override content so we don't get any smart stuff.
			this.content = '✔';
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
		// Well, when sending whispers we want to omit topic, rather than -
		// using "/whisper/their_addr" at send time.
		if (this.topic == null) {
			// Because we can receive a whisper locally, we sometimes -
			// need to override the topic manually.
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
