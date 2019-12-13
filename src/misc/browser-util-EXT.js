import { windows, extension, i18n, runtime, browserAction, notifications } from 'webextension-polyfill';
import isNumber from 'is-number';
import throttle from 'lodash.throttle';
import configs from 'Approot/misc/configs-APP_TARGET';

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

export const createNotification = throttle((options) => {
	if (configs.showNotifications) {
		return notifications.create('d-chat', {
			type: 'basic',
			title: options.title || '',
			message: options.message || '',
			iconUrl: runtime.getURL('/img/NKN_D-chat_blue-64cropped.png'),
		});
	}
}, 250, { trailing: false });

export const IS_SIDEBAR = window.location.href.includes('sidebar.html');

/**
 * Checks if popup view is open, returns path or false.
 */
export const getPopupURL = () => {
	const w = extension.getViews({
		type: 'popup',
	})?.[0];
	// Only mark unread if chat isn't currently open in popup.
	return w?.location.hash;
};

/**
 * Pops out a window.
 */
export const popout = url => windows.create({
	url: runtime.getURL(`sidebar.html#/${url}`),
	type: 'popup',
	height: 860,
	width: 680,
});

export const reload = () => runtime.reload();
