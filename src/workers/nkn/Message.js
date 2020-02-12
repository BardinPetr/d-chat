import uuidv4 from 'uuid/v4';

/**
 * Here lies the D-Chat NKN message schema.
 *
 * Some things:
 *  Topic is chatroom topic.
 *   Omit `topic` in whispers.
 *  Specify a unique ID so people can react to certain messages via `targetID`.
 *  `timestamp` from Date.now() (ms since epoch).
 *
 * `targetID` is like "reply to message that has this ID".
 *
 * {id,topic,addr,targetID} each have max length of 128 characters.
 * That means you should set max length of NKN identifier at 63.
 *
 * Example of a text message that is sent out:
 *
 * ```json
 * {
 *   contentType: 'text',
 *   content: 'some _markdown_ format text',
 *   id: '{123-321-3213-21435tr}', // uuidv4(). Do not use uuidv1, because it will create duplicates.
 *   // D-Chat has some issues with percentage signs in topic names, because of url encoding.
 *   topic: 'topic name',
 *   // Older versions used .toUTCString(), so do take care before assuming it is integer.
 *   timestamp: ${Date.now()},
 * }
 * ```
 *
 * Media messages are the same except `contentType: 'media'`, -
 * the media is sent with `content: "![](base64datastring)".`
 * Reactions are `contentType: 'reaction'` and include `targetID`.
 * Topic is omitted in whispers, and `isPrivate: true` is added.
 *
 * Whispers have field `isPrivate: true` set, so that -
 * in the future, you can whisper to people inside a topic -
 * and not create a new private chatroom, but just display -
 * the message in the topic chatroom. It is not used in D-Chat for anything yet, -
 * and is mostly optional for now.
 * D-Chat adds it in nkn/nkn.js: `sendMessage()`.
 *
 * After receiving a message that wants confirmation that it was received  (ex. whisper), -
 * you should send a receipt to the sender. Sames as text message, except no `content`, and -
 * contentType is set to 'receipt'.
 *
 * Summing up a list of contentTypes used by D-Chat:
 * - dchat/subscribe
 * - media
 * - message/delete
 * - reaction
 * - receipt
 * - text
 *
 * And on pause:
 * - nkn/tip
 * - background
 * - heartbeat
 *
 * About the use of each contentType:
 * - 'dchat/subscribe', that is used when announcing -
 *   joining the chat. In D-Chat, receiving one triggers a "getSubscribers".
 * - 'receipt', that is is like reaction without content.
 *   It is used for notifying "message received".
 * - 'nkn/tip': was used before but not currently, but might make a -
 *   comeback at some point in time.
 * - 'message/delete': Deletes (hides, actually) a message by targetID.
 *
 * For messages that don't want user reaction, you might use `contentType: 'background'`.
 *
 * Rest of stuff is internal or old stuff, didn't have the presence of mind to underscore them.
 *
 * Do not treat messages as trusted content, see `IncomingMessage.js`.
 */
class Message {

	constructor(message) {
		// TODO is.string() checks
		this.contentType = message.contentType || 'text';
		this.id = message.id || uuidv4();

		this.topic = message.topic;

		this.timestamp = message.timestamp || Date.now();

		// Another message's ID.
		// Useful for reactions, tips, etc. Anything you use on a specific message.
		this.targetID = message.targetID;
		this.content = message.content;
	}

}

export default Message;
