/**
 * Contains a variety of utility functions.
 *
 * They are all over the place. TODO make some sense of these.
 */
import shasum from 'shasum';
import protocol from 'nkn-wallet/lib/crypto/protocol';
import { matchPath } from 'react-router-dom';

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
 * When you subscribe to '#d-chat', you actually sub to `'dchat'+shasum('d-chat')`.
 */
export function genChatID(topic) {
	if (!topic) {
		return null;
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

/**
 * Encodes topics for URL.
 */
export function getChatURL(topic) {
	topic = topic.replace(/%/g, '%25');
	if (isWhisperTopic(topic)) {
		return getWhisperURL(topic);
	}

	topic = getChatName(topic);
	if (!topic) {
		return '';
	}
	// Usually shoved to <Link to={} /> so remember to prepend '#' on form actions etc.
	return '/chat/' + topic;
}

/**
 * Topics without hash, whispers as they come.
 * URL decoded.
 */
export function getChatName(topic) {
	if (!topic) {
		return null;
	}
	if (isWhisperTopic(topic)) {
		return getWhisperTopic(topic);
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

	pubkey = pubkey.slice(0, 8);
	if (name) {
		return [name, pubkey].join('.');
	} else {
		return pubkey;
	}
};

/**
 * Finds NKNXyzfsd wallet address for nkn addr (ident.pubkey).
 *
 * @return String nknAddress.
 */
export const getAddressFromAddr = theAddr => {
	const [, pubkey] = parseAddr(theAddr);
	const nknAddress = protocol.programHashStringToAddress(
		protocol.hexStringToProgramHash(
			protocol.publicKeyToSignatureRedeem(pubkey),
		),
	);
	return nknAddress;
};

/**
 * Encodes whisper topics for URL.
 *
 * Example: sending whispers to 'hi # my name is /not too good/.'
 * turns to '/whisper/hi%20%23%20my%20name%20is%20%2Fnot%20too%20good%2F.'
 */
export function getWhisperURL(topic) {
	const recipient = getWhisperRecipient(topic);
	return `/whisper/${recipient}`;
}

export function getWhisperTopic(topic) {
	topic = getWhisperRecipient(topic);
	return `/whisper/${topic}`;
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

// nkn/tip was used once, but is gone now.
export const isNotice = msg => ['dchat/subscribe', 'nkn/tip'].includes(msg.contentType);

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
	let path = matchPath(pathname, {
		path: '/chat/*',
	})?.params?.[0];
	if (!path) {
		path = matchPath(pathname, {
			path: '/whisper/*',
		})?.params?.[0];
		if (path) {
			return getWhisperTopic(path);
		}
	} else {
		return path;
	}
}
