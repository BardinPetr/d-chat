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
			data = href.slice(href.indexOf(',') + 1);
			data = base64ToBlob(data, mime);
			data = URL.createObjectURL(data);
		} catch (e) {
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
		return `<img src="${href}" alt=${text}>`;
	}
};
marked.setOptions({
	highlight: (code, lang) => highlight.highlightAuto(code, [lang]).value,
	renderer,
});

const allowedTags = [
	'a',
	'audio',
	'b',
	'blockquote',
	'br',
	'caption',
	'code',
	'em',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'i',
	'img',
	'li',
	'ol',
	'p',
	'pre',
	'span',
	'strike',
	'strong',
	'table',
	'tbody',
	'td',
	'th',
	'thead',
	'tr',
	'ul',
	'video',
];
const allowedSchemes = ['http', 'https', 'blob'];
const allowedAttributes = { ...sanitize.defaults.allowedAttributes };
allowedAttributes.video = ['src', 'controls', 'loop', 'playsinline'];
allowedAttributes.audio = ['src', 'controls', 'loop'];
allowedAttributes.image = ['src', 'alt'];
allowedAttributes.span = ['class'];

class IncomingMessage extends Message {
	constructor(message) {
		super(message);
		this.messageClass = 'IncomingMessage';

		// Heartbeats should not be received as messages.
		if (
			['heartbeat', 'background'].includes(this.contentType) ||
			(!this.topic && !this.isPrivate)
		) {
			this.unreceivable = true;
		}

		// Sanitize first so we only use markdown stuff.
		const sanitized = sanitize(message.content || '').replace(/&gt;/g, '>');
		const markdowned = marked(sanitized, {
			breaks: true,
		});
		const handled = sanitize(markdowned, {
			allowedTags,
			allowedSchemes,
			allowedAttributes,
		}).trim();
		this.content = handled;
	}
}

export default IncomingMessage;
