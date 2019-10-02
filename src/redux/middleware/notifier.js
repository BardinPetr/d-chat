import {
	getChatDisplayName,
	isNotice,
} from 'Approot/misc/util';
import {
	setBadgeText,
	createNotification,
	getPopupURL,
} from 'Approot/misc/browser-util-APP_TARGET';
import {
	markUnread,
} from 'Approot/redux/actions';

const getUnreadMessages = state => {
	const chats = Object.values(state.chatSettings);
	return chats.reduce((acc, settings) => acc + (settings.unread?.length || 0), 0);
};

const notifier = store => next => action => {
	let message = action.payload?.message;
	let w;
	switch (action.type) {
		case 'chat/RECEIVE_MESSAGE':
			w = getPopupURL();
			// Only mark unread if chat isn't currently open in popup.
			if (!w?.includes(message.topic)) {
				if (!isNotice(message) && !message.isMe && !message.isSeen) {
					store.dispatch(markUnread(message.topic, message));
				}
			}
			break;

		case 'chat/MARK_UNREAD':
			if (!isNotice(message)) {
				if (!message.isMe) {
					createNotification({
						message: message.content,
						title: message.title || `D-Chat ${getChatDisplayName(message.topic)}, ${message.username}.${message.pubKey?.slice?.(0, 8)}:`,
					});
					setBadgeText(getUnreadMessages(store.getState()) + 1);
				}
			}
			break;

		case 'chat/MARK_READ':
			setBadgeText(getUnreadMessages(store.getState()) - action.payload.ids.length);
			break;
	}
	next(action);
};

export default notifier;
