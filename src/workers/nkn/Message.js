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
 *   // Older versions used .toUTCString(), so do take care before assuming it is integer.
 *   timestamp: ${Date.now()},
 * }
 * ```
 *
 * Topic is omitted in whispers, and `isPrivate: true` is added.
 * Media messages are the same except `contentType: 'media'`, -
 * the media is sent with `content: "![](base64datastring)".`
 * Reactions are `contentType: 'reaction'` and include `targetID`.
 *
 * Whispers have field `isPrivate: true` set, so that -
 * in the future, you can whisper to people inside a topic -
 * and not create a new private chatroom, but just display -
 * the message in the topic chatroom. It is not used in D-Chat for anything, -
 * and is mostly optional for now.
 * D-Chat adds it in nkn/nkn.js: `sendMessage()`.
 *
 * There is also a contentType: 'dchat/subscribe', that is used when announcing -
 * joining the chat, and contentType: 'receipt', that is is like reaction without content.
 * Receipt is used for notifying "message received".
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
