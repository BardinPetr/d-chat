import { playNotificationSound } from './common';
import throttle from 'lodash.throttle';
import configs from 'Approot/misc/configs-APP_TARGET';

export function __(str) {
	// TODO
	return str;
}

export const setBadgeText = () => {};

export const createNotification = throttle(options => {
	if (configs.audioNotifications) {
		playNotificationSound();
	}
	if (configs.notifications && options.message) {
		return new Notification(options.title || 'D-Chat', {
			body: options.message || '',
			icon: '/img/NKN_DCHAT-128-128-border16.png',
		});
	}
}, 250, { trailing: false });

export const getPopupURL = () => '';

export const popout = () => {};

export const reload = () => {};

export const requestPermissions = async () => {
	if (!Notification) {
		throw new Error('No Notifications');
	}
	const res = await Notification.requestPermission();
	if (res === 'granted') {
		return true;
	} else {
		return false;
	}
};
