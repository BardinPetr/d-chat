import shasum	from 'shasum';
import { i18n, runtime } from 'webextension-polyfill';

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
	topic	=	unleadingHashIt(String(topic));
	// Api/code	somewhere	does not like	strings	that start with	numbers.
	return 'dchat' + shasum(topic);
}

export function	getChatName(topic) {
	if (!topic)	{
		return null;
	}
	topic	=	leadingHashIt(String(topic));
	return topic;
}

export function __(str, placeholders) {
	// The i18n generator has a bug with empty prefix, so trim.
	// Chrome doesn't want things in the keys.
	return i18n.getMessage(str.replace(/[^a-zA-Z_]/g, ''), placeholders).trim();
}

export const IS_FIREFOX = runtime.id === 'dchat@losnappas';
