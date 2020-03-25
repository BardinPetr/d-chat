/**
 * 1. Creates notifications and changes badge text.
 * 2. Sends back 'received' acknowledgements for private messages.
 */

import sanitize from 'striptags';
import {
	getChatDisplayName,
	isNotice,
	isWhisper,
	isDelete,
	formatAddr,
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

const shouldNotify = message =>
	!isNotice(message)
	&& !message.isMe
	&& !message.ignored;
const wantsAck = msg =>
	!isNotice(msg)
	&& !isDelete(msg)
	&& isWhisper(msg)
	&& !msg.ignored;

const notifier = store => next => action => {
	const message = action.payload?.message;
	const topic = action.payload?.topic;
	const state = store.getState();
	let w, content = message?.content || '';

	switch (action.type) {
		case 'chat/RECEIVE_MESSAGE':
			// Only mark unread if chat isn't currently open in popup.
			w = getPopupURL();
			if (
				!w?.includes(message.topic)
				&& shouldNotify(message)
			) {
				store.dispatch(markUnread(message.topic, message));
			}
			if (wantsAck(message)) {
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
					title: message.title || `${__('D-Chat')} ${getChatDisplayName(message.topic)}, ${formatAddr(message.addr)}:`,
				});
				setBadgeText(getUnreadMessages(state) + 1);
			}
			break;

		case 'chat/MARK_READ':
			setBadgeText(getUnreadMessages(state) - action.payload.ids.length);
			break;
	}
	next(action);

	function sendAck(toMessage) {
		const { id, topic, isMe } = toMessage;
		if (!isMe) {
			store.dispatch(sendPrivateMessage({
				contentType: 'receipt',
				topic,
				targetID: id,
			}));
		}
	}
};

export default notifier;
