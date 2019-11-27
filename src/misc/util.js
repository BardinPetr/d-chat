import shasum from 'shasum';
import protocol from 'nkn-wallet/lib/crypto/protocol';

export const isWhisperTopic = topic => !!topic?.startsWith('/whisper/');

/**
 * Extracts the whisper recipient from whisper topic.
 */
export const getWhisperRecipient = topic =>
	isWhisperTopic(topic) ?
		topic.slice('/whisper/'.length) :
		topic;

function unleadingHashIt(str) {
	return str.replace(/^#*/, '');
}

function leadingHashIt(str) {
	return '#' + unleadingHashIt(str);
}

export function genChatID(topic) {
	if (!topic) {
		return null;
	}
	topic = unleadingHashIt(String(topic));
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
	return leadingHashIt(String(topic));
}

export function getChatURL(topic) {
	if (isWhisperTopic(topic)) {
		return topic;
	}

	topic = getChatDisplayName(topic);
	if (!topic) {
		return '';
	}
	// Usually shoved to <Link to={} /> so remember to prepend '#' on form actions etc.
	return '/chat/' + topic.slice(1);
}

export const isWhisper = message => isWhisperTopic(message.topic);

export function getChatName(topic) {
	if (!topic) {
		return null;
	}
	if (isWhisperTopic(topic)) {
		return topic;
	}
	topic = unleadingHashIt(String(topic));
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

// 3 of the same, I think the naming makes sense...?
export const getWhisperURL = recipient =>
	isWhisperTopic(recipient) ? recipient : `/whisper/${recipient}`;
export const genPrivateChatName = getWhisperURL;
export const getWhisperTopic = getWhisperURL;

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
