import sanitize from 'sanitize-html';
import marked from 'marked';
import Message from './Message';

class IncomingMessage extends Message {
	constructor(message) {
		super(message);
		this.messageClass = 'IncomingMessage';

		// Sanitize data when message arrives.
		this.content = sanitize(marked(message.content || '')).trim();
	}
}

export default IncomingMessage;
