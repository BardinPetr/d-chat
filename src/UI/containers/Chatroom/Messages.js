import React, { useEffect, useCallback, useState, useReducer } from 'react';
import { connect } from 'react-redux';
import MessagesList from 'Approot/UI/components/Chatroom/MessagesList';
import MessagesScroller from 'Approot/UI/components/Chatroom/MessagesScroller';
import { loadMessagesFromDb, PAGE_SIZE } from 'Approot/database/messages';

function reducer(state, action) {

	const changes = action.payload;

	switch(action.type) {
		case 'modify':
			return state.map(msg => {
				if (msg.id === changes.id) {
					return changes;
				}
				return msg;
			});

		case 'new':
			return [...state, changes];

		case 'old':
			return [...changes, ...state];

		case 'next':
			return [...changes];
	}
}

const Messages = ({
	createReaction,
	lastReadId,
	markAllMessagesRead,
	messageEvent,
	mutedUsers,
	myAddr,
	refer,
	subs,
	topic,
	unreadCount,
}) => {
	const [messages, dispatch] = useReducer(reducer, []);
	const [hasMore, setHasMore] = useState(true);

	const loadMore = useCallback(() => {
		if (!topic) {
			return;
		}
		const previous =
			topic === messages[0]?.topic
				? messages[0]
				: undefined;

		loadMessagesFromDb({
			topic,
			previous: previous,
		}).then(prevMessages => {
			if (prevMessages.length < PAGE_SIZE) {
				setHasMore(false);
			}

			dispatch({ type: 'old', payload: prevMessages });
		});
	}, [topic, messages[0]]);

	useEffect(() => {
		if (
			!messageEvent.message
			|| !topic
			|| topic !== messageEvent.topic
		) {
			return;
		}

		dispatch({
			type: messageEvent.type,
			payload: messageEvent.message,
		});

	}, [messageEvent, topic]);

	// Loads initial messages.
	useEffect(() => {
		if (!topic) {
			return;
		}

		loadMessagesFromDb({
			topic,
			extra: unreadCount,
		})
			.then(prevMessages => {
				dispatch({ type: 'next', payload: prevMessages });
			})
			// New chat -> assume has messages.
			.then(() => setHasMore(true));
	}, [topic]);

	return (
		<MessagesScroller
			listClassname="x-is-fullwidth is-scrollable is-relative x-chatroom-messages"
			scrollTriggers={[topic, messages.length]}
			markAllMessagesRead={markAllMessagesRead}
			topic={topic}
			loadMore={loadMore}
			hasMore={hasMore}
		>
			<MessagesList
				messages={messages}
				refer={refer}
				lastReadId={lastReadId}
				subs={subs}
				topic={topic}
				myAddr={myAddr}
				createReaction={createReaction}
				mutedUsers={mutedUsers}
			/>
		</MessagesScroller>
	);
};

const mapStateToProps = (state, ownProps) => ({
	messageEvent: state.messageEvent,
	unreadCount: state.chatSettings[ownProps.topic]?.unread?.length || 0,
	mutedUsers: state.globalSettings.muted,
});

export default connect(mapStateToProps)(Messages);
