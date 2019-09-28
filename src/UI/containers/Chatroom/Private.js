// eslint-disable-next-line no-unused-vars
import React from 'react';
import { connect } from 'react-redux';

import Chatroom from 'Approot/UI/components/Chatroom';
import { markRead, sendPrivateMessage, saveDraft } from 'Approot/redux/actions';
import { genPrivateChatName } from 'Approot/misc/util';

const mapStateToProps = (state, ownProps) => {
	const recipient = ownProps.match.params.recipient;
	const topic = genPrivateChatName(recipient);
	return {
		draft: state.draftMessage,
		messages: state.messages[topic] || [],
		// reactions: state.reactions[topic] || {},
		unreadMessages: state.chatSettings[topic]?.unread || [],
		topic: recipient,
		subs: [recipient, state.login?.addr],
		client: state.clients.find(c => c.active),
	};
};

const mapDispatchToProps = dispatch => ({
	createMessage: message => dispatch(sendPrivateMessage(message)),
	saveDraft: draft => dispatch(saveDraft(draft)),
	markAsRead: (recipient, ids) =>
		dispatch(markRead(genPrivateChatName(recipient), ids)),
	getSubscribers: () => {},
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Chatroom);
