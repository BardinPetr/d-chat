import sanitize from 'sanitize-html';
import marked from 'marked';
import Message from './Message';
import highlight from 'highlight.js';
import base64ToBlob from 'b64-to-blob';
import base64Mime from 'base64mime';

const renderer = new marked.Renderer();
renderer.image = (href, title, text) => {
	if (href.startsWith('data')) {
		let mime, data;
		try {
			mime = base64Mime(href);
			data = href.slice(href.indexOf(',')+1);
			data = base64ToBlob(data, mime);
			data = URL.createObjectURL(data);
		} catch(e) {
			console.error(e);
			return '';
		}
		if (href.startsWith('data:video/')) {
			return `<video src="${data}" controls loop playsinline></video>`;
		} else if (href.startsWith('data:audio/')) {
			return `<audio src="${data}" controls loop></audio>`;
		} else if (href.startsWith('data:image/')) {
			return `<img src="${data}" alt="${text}">`;
		} else {
			return '';
		}
	} else {
		return `<img src="${href}" decoding="async" alt=${text}>`;
	}
};
marked.setOptions({
	highlight: code => highlight.highlightAuto(code).value,
	renderer,
});

const allowedTags = sanitize.defaults.allowedTags.concat([ 'img', 'audio', 'video' ]);
const allowedSchemes = ['http', 'https', 'blob'];
let allowedAttributes = sanitize.defaults.allowedAttributes;
allowedAttributes.video = ['src', 'controls', 'loop', 'playsinline'];
allowedAttributes.audio = ['src', 'controls', 'loop'];
allowedAttributes.image = ['src', 'alt'];

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
