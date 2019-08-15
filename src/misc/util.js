import shasum	from 'shasum';
import { i18n, runtime, browserAction } from 'webextension-polyfill';
import isNumber from 'is-number';
import protocol from 'nkn-wallet/lib/crypto/protocol';

function unleadingHashIt(str){
	return str.replace(/^#*/,	'');
}

function leadingHashIt(str){
	return '#' + unleadingHashIt(str);
}

export function	genChatID(topic) {
	if (!topic){
		return null;
	}
	topic = unleadingHashIt(String(topic));
	// Api/code somewhere does not like strings that start with numbers.
	return 'dchat' + shasum(topic);
}

export function getChatDisplayName(topic) {
	if (!topic){
		return null;
	}
	return leadingHashIt(String(topic));
}

export function	getChatName(topic) {
	if (!topic)	{
		return null;
	}
	topic	=	unleadingHashIt(String(topic));
	if (!topic) {
		return null;
	}
	return topic;
}

export function __(str, placeholders) {
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

export const getAddressFromIdentifier = addr => {
	const lastDotPosition = addr.lastIndexOf('.');
	let nknAddress = addr;
	if (lastDotPosition !== -1) {
		nknAddress =  addr.slice(lastDotPosition + 1);
	}
	nknAddress = protocol.programHashStringToAddress(
		protocol.hexStringToProgramHash(
			protocol.publicKeyToSignatureRedeem(nknAddress)
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
