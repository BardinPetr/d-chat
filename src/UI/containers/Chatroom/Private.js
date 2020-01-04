// eslint-disable-next-line no-unused-vars
import React from 'react';
import { connect } from 'react-redux';

import Chatroom from 'Approot/UI/components/Chatroom';
import { markRead, sendPrivateMessage } from 'Approot/redux/actions';
import { getTopicFromPathname, getWhisperRecipient } from 'Approot/misc/util';

const mapStateToProps = (state) => {
	const topic = getTopicFromPathname(location.hash);
	const recipient = getWhisperRecipient(topic);
	return {
		client: state.clients.find(c => c.active),
		subs: [recipient, state.login?.addr],
		topic,
		unreadMessages: state.chatSettings[topic]?.unread || [],
	};
};

const mapDispatchToProps = dispatch => ({
	createMessage: message => dispatch(sendPrivateMessage(message)),
	getSubscribers: () => {},
	markAsRead: (topic, ids) => dispatch(markRead(topic, ids)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Chatroom);
