import { i18n, runtime, browserAction, notifications } from 'webextension-polyfill';
import isNumber from 'is-number';
import debounce from 'debounce';
import configs from 'Approot/misc/configs';

export function __(str, ...placeholders) {
	// The i18n generator has a bug with empty prefix, so trim.
	// Chrome doesn't want things in the keys.
	return i18n.getMessage(str.replace(/[^a-zA-Z_]/g, ''), placeholders).trim();
}

export const IS_FIREFOX = runtime.id === 'dchat@losnappas';

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

export const createNotification = debounce((options) => {
	if (configs.showNotifications) {
		return notifications.create( 'd-chat', {
			type: 'basic',
			title: options.title || '',
			message: options.message || '',
			iconUrl: runtime.getURL('/img/NKN_D-chat_blue-64cropped.png'),
		});
	}
}, 1000, true);

export const IS_SIDEBAR = window.location.href.includes('sidebar.html');
