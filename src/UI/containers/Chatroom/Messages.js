import React, { useEffect, useState, useReducer } from 'react';
import { connect } from 'react-redux';
import MessagesComponent from 'Approot/UI/components/Chatroom/Messages';
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
	topic,
	messageEvent,
	...rest
}) => {
	const [messages, dispatch] = useReducer(reducer, []);
	const [hasMore, setHasMore] = useState(true);

	const loadMore = () => {
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
	};

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

	useEffect(() => {
		if (!topic) {
			return;
		}

		loadMessagesFromDb({ topic })
			.then(prevMessages => dispatch({ type: 'next', payload: prevMessages }))
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

const mapStateToProps = state => ({
	messageEvent: state.messageEvent,
});

export default connect(mapStateToProps)(Messages);
