import Message from './Message';

class OutgoingMessage extends Message {
	constructor(message) {
		super(message);

		// Let's delete some useless, internal, data.
		this.isMe = undefined;
		this.addr = undefined;
		this.pubKey = undefined;
		this.refersToMe = undefined;
		this.username = undefined;
		this.title = undefined;
		this.isSeen = undefined;
		this.ping = undefined;
		this.messageClass = undefined;
	}
}

export default OutgoingMessage;
