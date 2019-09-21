// eslint-disable-next-line no-unused-vars
import React from 'react';
import { connect } from 'react-redux';

import Chatroom from 'Approot/UI/components/Chatroom';
import {
	getMessages,
	getSubscribers,
	markRead,
	publishMessage,
	saveDraft,
} from 'Approot/redux/actions';

const mapStateToProps = (state, ownProps) => {
	const topic = ownProps.match.params.topic;
	return {
		draft: state.draftMessage,
		messages: state.messages[topic] || [],
		reactions: state.reactions[topic] || {},
		unreadMessages: state.chatSettings[topic]?.unread || [],
		topic: topic,
		subs: state.chatSettings[topic]?.subscribers || [],
		client: state.clients.find(c => c.active),
		hasMore: (state.chatSettings[topic]?.messages || 0) > (state.messages[topic]?.length || 0),
	};
};

const mapDispatchToProps = dispatch => ({
	createMessage: message => dispatch(publishMessage(message)),
	saveDraft: draft => dispatch(saveDraft(draft)),
	markAsRead: (topic, ids) => dispatch(markRead(topic, ids)),
	getSubscribers: topic => dispatch(getSubscribers(topic)),
	getMessages: (topic, opts) => dispatch(getMessages(topic, opts)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Chatroom);
