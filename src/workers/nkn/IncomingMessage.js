import { getWhisperTopic, formatAddr, isDelete } from 'Approot/misc/util';
import NKN from 'Approot/workers/nkn/nknHandler';
import sanitize from 'sanitize-html';
import marked from 'marked';
import Message from './Message';
import highlight from 'highlight.js';
import debounce from 'debounce';

const renderer = new marked.Renderer();
renderer.image = (href, title, text) => {
	if (href.startsWith('data')) {
		return '';
	} else {
		return `<img src="${href}" alt="${text}" title="${title}">`;
	}
};
// Tried settings links like 'wikipedia.org', but that makes '@someone.12345678' a link too.
// The canonical markdown way is '<wikipedia.org>', but that doesn't work for us.
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

// Match `data:` urls. data:something...{ends in NOT whitespace and NOT closing bracket}.
const dataUrl = /data:[^\s)]*/gi;

// 4 seconds.
const DELAY_AFTER_CONNECT = 4000;

class IncomingMessage extends Message {

	// Firefox with privacy.resistFingerprinting has reduced time precision -
	// of 100ms, which makes Date.now() create dupes, -
	// and then messages get shuffled on startup. Workaround.
	static nonce = 0.001;

	// When connection starts, we want to use timestamps for messages we missed.
	// That way we get to keep message ordering closer to correct.
	static useTimestampForCreatedAt = false;
	static onConnect() {
		debounce(
			() => (IncomingMessage.useTimestampForCreatedAt = false),
			DELAY_AFTER_CONNECT
		);
		IncomingMessage.useTimestampForCreatedAt = true;
	}

	constructor(message) {
		super(message);

		this.createdAt = Date.now() + IncomingMessage.nonce;
		IncomingMessage.nonce += 0.001;

		if (IncomingMessage.useTimestampForCreatedAt) {
			this.createdAt = this.timestamp;
		}

		// Ignore topics and ids over 128 chars in length.
		// We don't want to get 50k chars as database index field.
		if (this.topic?.length > 128) {
			this.unreceivable = true;
		}
		if (this.targetID?.length > 128) {
			this.targetID = this.targetID.slice(0, 128);
		}
		if (this.id?.length > 128) {
			this.id = this.id.slice(0, 128);
		}

		this.receivedAs = NKN.instance.addr;

		// Heartbeats should not be received as messages.
		if (['heartbeat', 'background'].includes(this.contentType)) {
			this.unreceivable = true;
		}

		if (isDelete(message)) {
			this.modifications = {
				deleted: true
			};
		}

		// Due to change contentType 'receipt' to 'event:receipt' at some point.
		// TODO
		if (this.contentType === 'event:receipt') {
			this.contentType = 'receipt';
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

		// We'll just tag these for media.
		// https://docs.nkn.org/docs/d-chat-message-scheme
		if (['audio','image', 'video'].includes(this.contentType)) {
			this.contentType = 'media';
		}

		if (this.contentType !== 'reaction') {
			if (this.contentType === 'media') {
				const dataURLs = this.content.match(dataUrl) || [];
				this.attachments = dataURLs;

				/**
				 * Add space to avoid bug like -
				 * "https://example.org/![](data:LONG_LONG_LONG)" -
				 * would prevent data url from getting parsed and removed, ruining chat history.
				 */
				this.content = this.content.replace('![', ' ![');
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
			this.topic = opts.overrideTopic || getWhisperTopic(src);
		}

		this.addr = src;
		this.refersToMe = this.content?.includes(formatAddr(NKN.instance.addr));

		// We'll just ignore every addr that has an identifier that is too long.
		if (this.addr.length > 128) {
			this.unreceivable = true;
		}

		return this;
	}
}

export default IncomingMessage;
