import shasum from 'shasum';
import protocol from 'nkn-wallet/lib/crypto/protocol';

function unleadingHashIt(str){
	return str.replace(/^#*/, '');
}

function leadingHashIt(str){
	return '#' + unleadingHashIt(str);
}

export function genChatID(topic) {
	if (!topic){
		return null;
	}
	topic = unleadingHashIt(String(topic));
	// Api/code somewhere does not like strings that start with numbers.
	return 'dchat' + shasum(topic);
}

export function getChatDisplayName(topic) {
	if (!topic){
		return '';
	}
	if (topic.startsWith('/whisper/')) {
		return topic.slice('/whisper/'.length);
	}
	return leadingHashIt(String(topic));
}

export function getChatURL(topic) {
	if (!topic) {
		return '';
	}
	if (topic.startsWith('/whisper/')) {
		return topic;
	}

	topic = getChatDisplayName(topic);
	if (!topic) {
		return '';
	}
	// Usually shoved to <Link to={} /> so remember to prepend '#' on form actions etc.
	return '/chat/' + topic.slice(1);
}

export function getChatName(topic) {
	if (!topic) {
		return null;
	}
	if (topic.startsWith('/whisper/')) {
		return topic;
	}
	topic = unleadingHashIt(String(topic));
	if (!topic) {
		return null;
	}
	return topic;
}

export const formatAddr = addr => {
	const lastDotPosition = addr.lastIndexOf('.');
	let formattedAddr = '';
	if (lastDotPosition !== -1) {
		formattedAddr =  addr.substring(0, lastDotPosition + 7);
	} else {
		formattedAddr = addr.substring(0,6);
	}
	return formattedAddr;
};

export const parseAddr = addr => {
	if (!addr) {
		return ['', ''];
	}
	const lastDotPosition = addr.lastIndexOf('.');
	let pubKey = addr;
	let formattedAddr = '';
	if (lastDotPosition !== -1) {
		formattedAddr =  addr.substring(0, lastDotPosition);
		pubKey = addr.slice(lastDotPosition + 1);
	}
	return [ formattedAddr, pubKey ];
};

export const getAddressFromAddr = theAddr => {
	// eslint-disable-next-line
	const [_, pubkey] = parseAddr(theAddr);
	const nknAddress = protocol.programHashStringToAddress(
		protocol.hexStringToProgramHash(
			protocol.publicKeyToSignatureRedeem(pubkey)
		)
	);
	return nknAddress;
};

export const genPrivateChatName = (recipient) => `/whisper/${recipient}`;
export const getWhisperURL = (recipient) => `/whisper/${recipient}`;

export const log = (...args) => {
	if (localStorage.getItem('debug')) {
		console.log('d-chat:', args);
	}
};

export const isReaction = message => message.contentType === 'reaction' || message.contentType === 'nkn/tip';

export const importWallet = (file) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = e => {
			resolve(e.target.result);
		};
		reader.onerror = reject;
		reader.readAsText(file);
	});
};

export const isNotice = msg => (['dchat/subscribe', 'dchat/offerSubscribe'].includes(msg.contentType));

// This is the topic for the list of public topics.
export const DCHAT_PUBLIC_TOPICS = '__dchat';

export const ONE_SATOSHI = 0.00000001;
