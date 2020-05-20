import { getWhisperTopic, formatAddr, isDelete } from 'Approot/misc/util';
import NKN from 'Approot/workers/nkn/nknHandler';
import sanitize from 'sanitize-html';
import marked from 'marked';
import Message from './Message';
import debounce from 'debounce';
import isOnlyEmojis from 'is-only-emojis';
import highlight from 'Approot/misc/hljs-APP_TARGET';

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
	highlight: (code, lang) => highlight.highlightAuto(code, lang ? [lang] : undefined).value,
	renderer,
});

const allowedTags = [
	'a',
	'b',
	'blockquote',
	'br',
	'caption',
	'code',
	'del',
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

const onConnect = debounce(
	() => {
		IncomingMessage.useTimestampForCreatedAt = false;
	},
	// After 4 seconds.
	4000
);

/**
 * We've been pretty liberal with incoming message attributes.
 *
 * For example, messages that aren't "permitted" will have `hidden` attribute set.
 * Doesn't show here, though, since it is set in nknHandler.
 *
 * In essence, if something needs to be done on UI side, just add an attribute -
 * on the IncomingMessage somewhere, and handle it from the UI side.
 *
 * Long term, this is definitely not such a fantastic plan, but it's easy now.
 */
class IncomingMessage extends Message {

	static onConnect() {
		onConnect();
		IncomingMessage.useTimestampForCreatedAt = true;
	}

	/**
	 * Throws if unsupported content type.
	 */
	constructor(message) {
		super(message);

		if (!IncomingMessage.SUPPORTED_CONTENT_TYPES.includes(this.contentType)) {
			throw new Error('D-Chat: unsupported content type: ' + this.contentType);
		}

		if (IncomingMessage.useTimestampForCreatedAt) {
			this.createdAt = this.timestamp;
		} else {
			this.createdAt = Date.now();
		}

		this.createdAt += IncomingMessage.nonce;
		IncomingMessage.nonce += 0.001;

		// Topic can (locally) be over 128 with `/whisper/128lenaddr`, -
		// so we'll use 137.
		// We don't want to get 50k chars as database index field.
		if (this.topic?.length > 137) {
			this.unreceivable = true;
		}
		if (this.targetID?.length > 128) {
			this.targetID = this.targetID.slice(0, 128);
		}
		if (this.id?.length > 128) {
			this.id = this.id.slice(0, 128);
		}

		this.receivedAs = NKN.instance.addr;

		// Due to change contentType 'receipt' to 'event:receipt' at some point. Or not??
		if (this.contentType === 'event:receipt') {
			this.contentType = 'receipt';
		} else if (this.contentType === 'message/delete') {
			this.contentType = 'event:message/delete';
		} else if (this.contentType === 'dchat/subscribe') {
			this.contentType = 'event:subscribe';
		}

		// TODO should move these to UI side, probably.
		switch(this.contentType) {
			case 'event:subscribe':
				this.content = 'Joined channel.';
				break;

			case 'event:add-permission':
				this.content = `Accepting ${this.content?.addr}.`;
				// Trigger getSubscribers by using this event type.
				this.contentType = 'event:subscribe';
				break;

			case 'event:remove-permission':
				this.content = `Kicking ${this.content?.addr}.`;
				// Trigger getSubscribers by using this event type.
				this.contentType = 'event:subscribe';
				break;
		}

		if (isDelete(message)) {
			this.modifications = {
				deleted: true,
				_onConfirm: {
					content: '',
					attachments: []
				}
			};
		}

		// Handling receipts as reactions.
		if (this.contentType === 'receipt') {
			this.contentType = 'reaction';
			// Override content so we don't get any smart stuff.
			this.content = '✔';
		}

		if (typeof this.content === 'string') {
			this._sanitizeContent();
		}
	}

	/**
	 * Sanitizes message content (string).
	 */
	_sanitizeContent() {
		// Sanitize, so we only use markdown stuff.
		this.content = sanitize(this.content, {
			allowedTags: [],
			allowedAttributes: {},
		}) || '';
		if (this.content && isOnlyEmojis(this.content)) {
			this.isOnlyEmojis = true;
		}

		// We'll just tag these for media.
		// https://docs.nkn.org/docs/d-chat-message-scheme
		if (['audio','image', 'video'].includes(this.contentType)) {
			this.contentType = 'media';
		}

		// Don't want to insert <p> tags into reactions.
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

			// Replace &gt; with > to make blockquotes work.
			// Replacing &lt; would make '&lt;span class="section"&gt;' work, which is bad.
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
		this.refersToMe = this.content?.includes?.(formatAddr(NKN.instance.addr));

		// We'll just ignore every addr that has an identifier that is too long.
		if (this.addr.length > 128) {
			this.unreceivable = true;
		}

		return this;
	}
}

// When connection starts, we want to use timestamps for messages we missed.
// That way we get to keep message ordering closer to correct.
IncomingMessage.useTimestampForCreatedAt = false;

// Firefox with privacy.resistFingerprinting has reduced time precision -
// of 100ms, which makes Date.now() create dupes, -
// and then messages get shuffled on startup. Workaround.
IncomingMessage.nonce = 0.001;

IncomingMessage.SUPPORTED_CONTENT_TYPES = [
	'audio',
	'contact',
	'dchat/subscribe',
	'event:add-permission',
	'event:message/delete',
	'event:receipt',
	'event:remove-permission',
	'event:subscribe',
	'image',
	'media',
	'message/delete',
	'nkn/tip',
	'reaction',
	'receipt',
	'text',
	'video',
];

export default IncomingMessage;
