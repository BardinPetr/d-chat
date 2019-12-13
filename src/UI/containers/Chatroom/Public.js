// eslint-disable-next-line no-unused-vars
import React from 'react';
import { connect } from 'react-redux';

import Chatroom from 'Approot/UI/components/Chatroom';
import {
	getSubscribers,
	markRead,
	publishMessage,
	saveDraft,
} from 'Approot/redux/actions';

const mapStateToProps = (state, ownProps) => {
	const topic = ownProps.match.params.topic;
	return {
		client: state.clients.find(c => c.active),
		draft: state.draftMessage,
		subs: state.chatSettings[topic]?.subscribers || [],
		topic: topic,
		unreadMessages: state.chatSettings[topic]?.unread || [],
	};
};

const mapDispatchToProps = dispatch => ({
	createMessage: message => dispatch(publishMessage(message)),
	getSubscribers: topic => dispatch(getSubscribers(topic)),
	markAsRead: (topic, ids) => dispatch(markRead(topic, ids)),
	saveDraft: draft => dispatch(saveDraft(draft)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Chatroom);
