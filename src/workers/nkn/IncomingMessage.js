import { saveAttachment } from 'Approot/database/attachments';
import { genPrivateChatName, parseAddr, formatAddr } from 'Approot/misc/util';
import NKN from 'Approot/workers/nkn/nknHandler';
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
// Replace `wikipedia.org` with a link.
// It is sanitized afterwards, so not too worried here.
renderer.text = text =>
	(text.replace(/(\S+\b\.\b\S+)/g, match => `<a href="https://${match}" target="_blank" rel="noopener noreferrer">${match}</a>`));
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

// Match `data:` urls. data:something...{ends in NOT whitespace and NOT closing bracket}.
const dataUrl = /data:[^\s)]*/gi;

class IncomingMessage extends Message {

	// Firefox with privacy.resistFingerprinting has reduced time precision -
	// of 100ms, which makes Date.now() create dupes, -
	// and then messages get shuffled on startup. Workaround.
	static nonce = 0.0001;

	constructor(message) {
		super(message);

		this.createdAt = Date.now() + IncomingMessage.nonce;
		IncomingMessage.nonce += 0.0001;

		this.receivedAs = NKN.instance.addr;

		// Heartbeats should not be received as messages.
		if (['heartbeat', 'background'].includes(this.contentType)) {
			this.unreceivable = true;
		}

		// Handling receipts as reactions.
		if (this.contentType === 'receipt') {
			this.contentType = 'reaction';
			// Override content so we don't get any smart stuff.
			this.content = '✔';
		}

		this.content = sanitize(this.content, {
			allowedTags: [],
			allowedAttributes: {},
		}) || '';

		if (this.contentType !== 'reaction') {
			if (this.contentType === 'media') {
				const dataURLs = this.content.match(dataUrl) || [];
				this.attachments = dataURLs.map(data => saveAttachment({
					data,
					hash: shasum(data),
				}));
			}

			// Sanitize first so we only use markdown stuff.
			// Replace &gt; with > to make blockquotes work.
			const sanitized = this.content.replace(/&gt;/g, '>');
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

	/**
	 * Adds sender information to message.
	 *
	 * opts has `overrideTopic` to override topics.
	 * Othewise you will send a message to `/whisper/your_addr`, when -
	 * you want `/whisper/their_addr`.
	 */
	from(src, opts = {}) {
		if (src === 'me') {
			src = NKN.instance.addr;
		}

		if (src === NKN.instance.addr) {
			this.isMe = true;
		}

		// So why is topic set here and not the constructor?
		// Well, when sending whispers we want to omit topic, rather than -
		// using "/whisper/their_addr" at send time.
		if (this.topic == null) {
			// Because we can receive a whisper locally, we sometimes -
			// need to override the topic manually.
			this.topic = opts.overrideTopic || genPrivateChatName(src);
		}

		const [name, pubKey] = parseAddr(src);
		this.addr = src;
		this.username = name;
		this.pubKey = pubKey;
		this.refersToMe = this.content?.includes(formatAddr(NKN.instance.addr));

		return this;
	}
}

export default IncomingMessage;
