/**
 * 1. Filters out duplicate messages by comparing their id.
 * 2. Creates notifications and changes badge text.
 */

import sanitize from 'striptags';
import {
	getChatDisplayName,
	isNotice,
} from 'Approot/misc/util';
import {
	setBadgeText,
	createNotification,
	getPopupURL,
	__,
} from 'Approot/misc/browser-util-APP_TARGET';
import {
	markUnread,
} from 'Approot/redux/actions';

const getUnreadMessages = state => {
	const chats = Object.values(state.chatSettings);
	return chats.reduce((acc, settings) => acc + (settings.unread?.length || 0), 0);
};

const shouldNotify = message => !(isNotice(message) || message.isMe || message.isSeen);

const hasDupe = (initial, message) => initial.some(msg => msg.id === message.id);

const notifier = store => next => action => {
	const message = action.payload?.message;
	const topic = action.payload?.topic;
	let w, initial, targetID, content = message?.content || '';

	switch (action.type) {
		case 'chat/RECEIVE_REACTION':
			targetID = action.payload.message.targetID;
			initial = store.getState().reactions[topic]?.[targetID] || [];
			if (hasDupe(initial, message)) {
				return;
			}
			break;

		case 'chat/RECEIVE_MESSAGE':
			initial = store.getState().messages[topic] || [];
			// Check if duplicate and ignore.
			// Each id once, "would you like to sub" once.
			if (
				hasDupe(initial, message) ||
				(isNotice(message) &&
				initial[initial.length - 1]?.contentType === message.contentType)
			) {
				return;
			}
			// Only mark unread if chat isn't currently open in popup.
			w = getPopupURL();
			if (!w?.includes(message.topic) && shouldNotify(message)) {
				store.dispatch(markUnread(message.topic, message));
			}
			break;

		case 'chat/MARK_UNREAD':
			if (message.contentType === 'media') {
				content = __('Posted media.');
			} else {
				content = sanitize(content);
			}
			createNotification({
				message: content,
				title: message.title || `D-Chat ${getChatDisplayName(message.topic)}, ${message.username}.${message.pubKey?.slice?.(0, 8)}:`,
			});
			setBadgeText(getUnreadMessages(store.getState()) + 1);
			break;

		case 'chat/MARK_READ':
			setBadgeText(getUnreadMessages(store.getState()) - action.payload.ids.length);
			break;
	}
	next(action);
};

export default notifier;
