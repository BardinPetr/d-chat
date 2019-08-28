import shasum	from 'shasum';
import { i18n, runtime, browserAction, notifications } from 'webextension-polyfill';
import isNumber from 'is-number';
import protocol from 'nkn-wallet/lib/crypto/protocol';
import configs from 'Approot/misc/configs';

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
	topic = unleadingHashIt(String(topic));
	if (!topic) {
		return null;
	}
	return topic;
}

export function __(str, ...placeholders) {
	// The i18n generator has a bug with empty prefix, so trim.
	// Chrome doesn't want things in the keys.
	return i18n.getMessage(str.replace(/[^a-zA-Z_]/g, ''), placeholders).trim();
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

export const getAddressFromPubKey = pubKey => {
	const nknAddress = protocol.programHashStringToAddress(
		protocol.hexStringToProgramHash(
			protocol.publicKeyToSignatureRedeem(pubKey)
		)
	);
	return nknAddress;
};

export const setBadgeText = txt => {
	if (isNumber(txt)) {
		if (+txt < 0) {
			console.warn('Badge text was negative:', txt);
		}
		txt = (+txt <= 0) ? '' : txt;
	}
	browserAction.setBadgeText({
		text: String(txt)
	});
};

export const IS_FIREFOX = runtime.id === 'dchat@losnappas';

export const createNotification = async (options) => {
	if (configs.showNotifications) {
		return notifications.create( 'd-chat', {
			type: 'basic',
			title: options.title || '',
			message: options.message || '',
			iconUrl: runtime.getURL('/img/NKN_D-chat_blue-64cropped.png'),
		});
	}
};

export const genPrivateChatName = (recipient) => `/whisper/${recipient}`;
export const getWhisperURL = (recipient) => `/whisper/${recipient}`;
