/**
 * Handles both public and private chats.
 */
import { connect } from 'react-redux';

import {
	getTopicFromPathname,
	getWhisperRecipient,
	isWhisperTopic,
} from 'Approot/misc/util';
import Chatroom from 'Approot/UI/components/Chatroom';
import {
	getSubscribers,
	markRead,
	publishMessage,
	sendPrivateMessage,
} from 'Approot/redux/actions';

const mapStateToProps = (state, ownProps) => {
	const topic = getTopicFromPathname(ownProps.location.pathname);
	const recipient = isWhisperTopic(topic) ? getWhisperRecipient(topic) : null;

	return {
		client: state.clients.find(c => c.active),
		subs: state.chatSettings[topic]?.subscribers || [recipient, state.login?.addr],
		topic,
		unreadMessages: state.chatSettings[topic]?.unread || [],
		chatType: isWhisperTopic(topic) ? 'whisper' : 'chat',
	};
};

const mapDispatchToProps = dispatch => ({
	createMessage (type, message) {
		let action;
		if (type === 'chat') {
			action = publishMessage(message);
		} else if (type === 'whisper') {
			action = sendPrivateMessage(message);
		}
		return dispatch(action);
	},
	getSubscribers (type, topic) {
		if (type === 'chat') {
			return dispatch(getSubscribers(topic));
		}
	},
	markAsRead (topic, ids) {
		return dispatch(markRead(topic, ids));
	},
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Chatroom);

