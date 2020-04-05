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
			icon: '/img/NKN_D-chat_blue-16.png',
		});
	}
}, 250, { trailing: false });

export const getPopupURL = () => '';

export const popout = () => {};

export const reload = () => {};

export const requestPermissions = async () => {
	return Notification?.requestPermission();
};
