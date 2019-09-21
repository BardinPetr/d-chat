import sanitize from 'sanitize-html';
import marked from 'marked';
import Message from './Message';
import highlight from 'highlight.js';

marked.setOptions({
	highlight: code => highlight.highlightAuto(code).value,
});

const allowedTags = sanitize.defaults.allowedTags.concat([ 'img' ]);

class IncomingMessage extends Message {
	constructor(message) {
		super(message);
		this.messageClass = 'IncomingMessage';

		// Sanitize data when message arrives.
		this.content = sanitize(marked(message.content || ''), {
			allowedTags,
		}).trim();
	}
}

export default IncomingMessage;
