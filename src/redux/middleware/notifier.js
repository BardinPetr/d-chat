/**
 * 1. Filters out duplicate messages by comparing their id.
 * 2. Creates notifications and changes badge text.
 * 3. Sends back 'received' acknowledgements for private messages.
 */

import sanitize from 'striptags';
import {
	getChatDisplayName,
	isNotice,
	isWhisper,
} from 'Approot/misc/util';
import {
	setBadgeText,
	createNotification,
	getPopupURL,
	__,
} from 'Approot/misc/browser-util-APP_TARGET';
import {
	markUnread,
	sendPrivateMessage,
} from 'Approot/redux/actions';

const getUnreadMessages = state => {
	const chats = Object.values(state.chatSettings);
	return chats.reduce((acc, settings) => {
		if (!settings.muted) {
			return acc + (settings.unread?.length || 0);
		} else {
			return acc;
		}
	}, 0);
};

const shouldNotify = message => !(isNotice(message) || message.isMe || message.isSeen);

const hasDupe = (initial, message) => initial.some(msg => msg.id === message.id);

const notifier = store => next => action => {
	const message = action.payload?.message;
	const topic = action.payload?.topic;
	const state = store.getState();
	let w, initial, targetID, content = message?.content || '';

	switch (action.type) {
		case 'chat/RECEIVE_REACTION':
			targetID = action.payload.message.targetID;
			initial = state.reactions[topic]?.[targetID] || [];
			if (hasDupe(initial, message)) {
				return;
			}
			break;

		case 'chat/RECEIVE_MESSAGE':
			initial = state.messages[topic] || [];
			// Check if duplicate and ignore.
			if (hasDupe(initial, message)) {
				return;
			}
			// Only mark unread if chat isn't currently open in popup.
			w = getPopupURL();
			if (
				!w?.includes(message.topic)
				&& shouldNotify(message)
			) {
				store.dispatch(markUnread(message.topic, message));
			}
			if (isWhisper(message) && !isNotice(message)) {
				sendAck(message);
			}
			break;

		case 'chat/MARK_UNREAD':
			if (message.contentType === 'media') {
				content = __('Posted media.');
			} else {
				content = sanitize(content);
			}
			if (!state.chatSettings[topic]?.muted || message.refersToMe) {
				createNotification({
					message: content,
					title: message.title || `D-Chat ${getChatDisplayName(message.topic)}, ${message.username}.${message.pubKey?.slice?.(0, 8)}:`,
				});
				setBadgeText(getUnreadMessages(state) + 1);
			}
			break;

		case 'chat/MARK_READ':
			setBadgeText(getUnreadMessages(state) - action.payload.ids.length);
			break;
	}
	next(action);

	// Should've put this thing in messageSentConfirmer instead, huh.
	function sendAck(toMessage) {
		const { id, topic, isMe } = toMessage;
		if (!isMe) {
			store.dispatch(sendPrivateMessage({
				contentType: 'reaction',
				topic,
				targetID: id,
				content: '✔',
			}));
		}
	}
};

export default notifier;
