import React, { useEffect, useCallback, useState, useReducer } from 'react';
import { connect } from 'react-redux';
import MessagesComponent from 'Approot/UI/components/Chatroom/Messages';
import { loadMessagesFromDb, PAGE_SIZE } from 'Approot/database/messages';
import uniqBy from 'lodash.uniqby';

function reducer(state, action) {

	const changes = action.payload;
	let next = [];
	switch(action.type) {
		case 'modify':
			next = state.map(msg => {
				if (msg.id === changes.id) {
					return changes;
				}
				return msg;
			});
			break;

		case 'new':
			// TODO instead of checking uniq, maybe add index to the react key prop.
			next = uniqBy([...state, changes], 'id');
			break;

		case 'old':
			next = [...changes, ...state];
			break;

		case 'next':
			next = [...changes];
			break;
	}

	return next.filter(msg => msg && !msg.ignored);
}

const Messages = ({
	topic,
	messageEvent,
	unreadCount,
	...rest
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
		<MessagesComponent
			topic={topic}
			messages={messages}
			loadMore={loadMore}
			hasMore={hasMore}
			{...rest}
		/>
	);
};

const mapStateToProps = (state, ownProps) => ({
	messageEvent: state.messageEvent,
	unreadCount: state.chatSettings[ownProps.topic]?.unread?.length || 0,
});

export default connect(mapStateToProps)(Messages);
