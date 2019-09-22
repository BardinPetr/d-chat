import sanitize from 'sanitize-html';
import marked from 'marked';
import Message from './Message';
import highlight from 'highlight.js';

const renderer = new marked.Renderer();
renderer.image = (href, title, text) => {
	if (href.startsWith('data:video/')) {
		return `<video src="${href}" preload controls loop playsinline></video>`;
	} else if (href.startsWith('data:audio/')) {
		return `<audio src="${href}" controls loop></audio>`;
	} else {
		return `<img src="${href}" decoding="async" alt=${text}>`;
	}
};
marked.setOptions({
	highlight: code => highlight.highlightAuto(code).value,
	renderer,
});

const allowedTags = sanitize.defaults.allowedTags.concat([ 'img', 'audio', 'video' ]);
const allowedSchemes = ['http', 'https', 'data'];
let allowedAttributes = sanitize.defaults.allowedAttributes;
allowedAttributes.video = ['src', 'controls', 'loop', 'preload', 'playsinline'];
allowedAttributes.audio = ['src', 'controls', 'loop'];
allowedAttributes.image = ['src', 'decoding'];

class IncomingMessage extends Message {
	constructor(message) {
		super(message);
		this.messageClass = 'IncomingMessage';

		// Sanitize data when message arrives.
		this.content = sanitize(marked(message.content || ''), {
			allowedTags,
			allowedSchemes,
		}).trim();
	}
}

export default IncomingMessage;
