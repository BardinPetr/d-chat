/**
 * Contains a variety of utility functions.
 *
 * They are all over the place. TODO make some sense of these.
 */
import shasum from 'shasum';
import { Wallet } from 'nkn-sdk';

export const isWhisperTopic = topic => !!topic?.startsWith('/whisper/');
export const isWhisper = message => isWhisperTopic(message.topic);

/**
 * Extracts the whisper recipient from whisper "topic".
 */
export const getWhisperRecipient = topic =>
	isWhisperTopic(topic) ?
		topic.slice('/whisper/'.length) :
		topic;

/**
 * Turns chat name into subscription target.
 *
 * When you subscribe to 'd-chat', you actually sub to `'dchat'+shasum('d-chat')`.
 */
export function genChatID(topic) {
	if (!topic) {
		return null;
	}
	// Already generated. Since nkn-sdk 1.1.3, it kinda is weird like that.
	if (topic.startsWith('dchat') && topic.length === 45) {
		return topic;
	}
	// Api/code somewhere does not like strings that start with numbers.
	return 'dchat' + shasum(topic);
}

export function getChatDisplayName(topic) {
	if (!topic) {
		return '';
	}
	if (isWhisperTopic(topic)) {
		return getWhisperRecipient(topic);
	}
	return topic;
}

export function getChatURL(topic) {
	if (!topic) {
		throw new Error('No topic: ' + topic);
	}
	if (isWhisperTopic(topic)) {
		return getWhisperURL(topic);
	}

	// Usually shoved to <Link to={} /> so remember to prepend '#' on form actions etc.
	return '/chat/' + topic;
}

export function getChatName(topic) {
	if (!topic) {
		return null;
	}
	return topic;
}

/**
 * Parses an NKN address (ident.pubkey).
 *
 * @return Array[formattedAddr, pubKey] Identifier or blank, and public key.
 */
export const parseAddr = addr => {
	if (!addr) {
		return ['', ''];
	}
	const lastDotPosition = addr.lastIndexOf('.');
	let pubKey = addr;
	let formattedAddr = '';
	if (lastDotPosition !== -1) {
		formattedAddr = addr.substring(0, lastDotPosition);
		pubKey = addr.slice(lastDotPosition + 1);
	}
	return [formattedAddr, pubKey];
};

/**
 * Formats an address for short-form displaying.
 */
export const formatAddr = addr => {
	if (!addr) {
		return false;
	}
	let [name, pubkey] = parseAddr(addr);

	if (name) {
		return name;
	} else {
		return pubkey.slice(0, 8);
	}
};

/**
 * Finds NKNXyzfsd wallet address for nkn addr (ident.pubkey).
 *
 * @return String nknAddress.
 */
export const getAddressFromAddr = theAddr => {
	const [, pubkey] = parseAddr(theAddr);
	const address = Wallet.publicKeyToAddress(pubkey);
	return address;
};

export function getWhisperURL(topic) {
	const recipient = getWhisperRecipient(topic);
	return `/whisper/${recipient}`;
}
export function getWhisperTopic(topic) {
	return getWhisperURL(topic);
}

export const importWallet = file => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = e => {
			resolve(e.target.result);
		};
		reader.onerror = reject;
		reader.readAsText(file);
	});
};

// If you change this, then probably touch on subFetcher middleware.
export const isNotice = msg => msg && [
	'event:subscribe',
	'dchat/subscribe'
].includes(msg.contentType);
export const isDelete = msg => msg && [
	'event:message/delete',
	'message/delete'
].includes(msg.contentType);
export const isContact = msg => msg && [
	'contact',
].includes(msg.contentType);

// This is the topic for the list of public topics.
export const DCHAT_PUBLIC_TOPICS = '__dchat';

export const ONE_SATOSHI = 0.00000001;

export const IS_EXTENSION = APP_TARGET === 'EXT';

export const isAck = reaction => reaction?.content === '✔';

// @someone.12345678
export const mention = addr => '@' + formatAddr(addr);

export const IS_SIDEBAR = location?.href.includes('popup.html') === false;

/**
 * Extracts topic from url.
 *
 * Most likely you feed this the 'window.location.hash' instead of 'history' stuff.
 * That is to avoid 'a#b#c' breaking everything.
 */
export function getTopicFromPathname(pathname) {
	pathname = pathname.replace(/^#/, '');
	// Get the '/chat/', or '/whisper/' part.
	const type = pathname.slice(
		0,
		pathname.indexOf('/', pathname.indexOf('/') + 1) + 1
	);
	let topic = pathname.slice(type.length);
	try {
		topic = decodeURIComponent(topic);
	} catch(e) {
		// If we got here, that means that -
		// there is a lone percentage-sign in topic name.
		// History module does not like it, at all.
		// This will be fixed in a future patch by 'history', probably.
	}

	switch (type) {
		case '/chat/':
			return topic;

		case '/whisper/':
			return getWhisperTopic(topic);
	}
}

export function isPermissionedTopic(topic) {
	if (isWhisperTopic(topic)) {
		return false;
	}
	topic = topic.slice(topic.lastIndexOf('.') + 1);
	return topic.length === 64 && topic;
}

export function isPublicTopic(topic) {
	return !isWhisperTopic(topic);
}

export const guessLatestBlockHeight = (function() {
	const inceptionTime = 1583501622400;
	const blocksAtInception = 968971;
	const estimatedBlockTime = 1000 * 21.575;
	return function () {
		const now = Date.now();
		// Assume 1 block every 21.5 seconds since inception.
		const blocksSinceInception = Math.floor((now - inceptionTime) / estimatedBlockTime);
		return blocksAtInception + blocksSinceInception;
	};
}());
