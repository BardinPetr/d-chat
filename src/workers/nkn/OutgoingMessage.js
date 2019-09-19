import Message from './Message';

class OutgoingMessage extends Message {
	constructor(message) {
		super(message);

		this.content = message.content;
		this.messageClass = 'OutgoingMessage';

		// Let's delete some useless, internal, data.
		this.isMe = undefined;
		this.addr = undefined;
		this.pubKey = undefined;
		this.refersToMe = undefined;
		this.username = undefined;
		this.title = undefined;
		this.isSeen = undefined;
		this.ping = undefined;
	}
}

export default OutgoingMessage;
