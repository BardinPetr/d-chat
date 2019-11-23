import { saveAttachment } from 'Approot/database/attachments';
import sanitize from 'sanitize-html';
import marked from 'marked';
import Message from './Message';
import highlight from 'highlight.js';
import shasum from 'shasum';

const renderer = new marked.Renderer();
renderer.image = (href, title, text) => {
	if (href.startsWith('data')) {
		return '';
	} else {
		return `<img src="${href}" alt=${text}>`;
	}
};
renderer.link = (href, title, text) =>
	(`<a href="${href}" target="_blank" title="${title || ''}" rel="noopener noreferrer">${text}</a>`);
marked.setOptions({
	highlight: (code, lang) => highlight.highlightAuto(code, [lang]).value,
	renderer,
});

const allowedTags = [
	'a',
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
];
const allowedSchemes = ['http', 'https'];
const allowedAttributes = JSON.parse(JSON.stringify(
	sanitize.defaults.allowedAttributes
));
allowedAttributes.image = ['src', 'alt'];
allowedAttributes.a = ['rel', 'target', 'href', 'title'];
allowedAttributes['*'] = ['class'];

// Match `data:` urls. data:something...{ends in NOT whitespace and NOT closing bracket}
const dataUrl = /data:[^\s)]*/gi;

class IncomingMessage extends Message {
	constructor(message) {
		super(message);
		this.messageClass = 'IncomingMessage';

		// Heartbeats should not be received as messages.
		if (['heartbeat', 'background'].includes(this.contentType)) {
			this.unreceivable = true;
		}

		let content = message.content || '';
		if (this.contentType === 'reaction') {
			this.content = sanitize(content);
		} else {
			if (this.contentType === 'media') {
				const dataURLs = content.match(dataUrl) || [];
				this.attachments = dataURLs.map(data => saveAttachment({
					data,
					hash: shasum(data),
				}));
			}

			// Sanitize first so we only use markdown stuff.
			// Replace &gt; with > to make blockquotes work.
			const sanitized = sanitize(content, {
				allowedTags: [],
				allowedAttributes: {},
			}).replace(/&gt;/g, '>');
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
}

export default IncomingMessage;
