import { v4 as uuidv4 } from 'uuid';

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
