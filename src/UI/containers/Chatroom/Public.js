// eslint-disable-next-line no-unused-vars
import React from 'react';
import { connect } from 'react-redux';

import Chatroom from 'Approot/UI/components/Chatroom';
import { getSubscribers, markRead, publishMessage, saveDraft } from 'Approot/redux/actions';

const mapStateToProps = (state, ownProps) => ({
	draft: state.draftMessage,
	messages: state.messages[ownProps.match.params.topic] || [],
	unreadMessages: state.chatSettings[ownProps.match.params.topic]?.unread || [],
	topic: ownProps.match.params.topic,
	subscribing: Object.keys(state.subscriptions).includes(ownProps.match.params.topic),
	subs: state.chatSettings[ownProps.match.params.topic]?.subscribers || [],
});

const mapDispatchToProps = dispatch => ({
	createMessage: message => dispatch(publishMessage(message)),
	saveDraft: draft => dispatch(saveDraft(draft)),
	markAsRead: (topic, ids) => dispatch(markRead(topic, ids)),
	getSubscribers: (topic) => dispatch(getSubscribers(topic)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Chatroom);
