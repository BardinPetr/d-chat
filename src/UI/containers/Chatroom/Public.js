// eslint-disable-next-line no-unused-vars
import React from 'react';
import { connect } from 'react-redux';

import { getTopicFromPathname } from 'Approot/misc/util';
import Chatroom from 'Approot/UI/components/Chatroom';
import {
	getSubscribers,
	markRead,
	publishMessage,
} from 'Approot/redux/actions';

const mapStateToProps = (state) => {
	const topic = getTopicFromPathname(location.hash);
	return {
		client: state.clients.find(c => c.active),
		subs: state.chatSettings[topic]?.subscribers || [],
		topic: topic,
		unreadMessages: state.chatSettings[topic]?.unread || [],
	};
};

const mapDispatchToProps = dispatch => ({
	createMessage: message => dispatch(publishMessage(message)),
	getSubscribers: topic => dispatch(getSubscribers(topic)),
	markAsRead: (topic, ids) => dispatch(markRead(topic, ids)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Chatroom);
