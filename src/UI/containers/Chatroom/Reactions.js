import React, { useEffect, useState, useReducer } from 'react';
import { connect } from 'react-redux';
import ReactionsComponent from 'Approot/UI/components/Chatroom/Reactions';
import { loadReactionsFromDb } from 'Approot/database/reactions';

function reducer(state, action) {

	const changes = action.payload;
	switch(action.type) {
		case 'new':
			return [...state, changes];

		case 'old':
			return [...changes, ...state];
	}
}

const Reactions = ({
	topic,
	messageID,
	stayScrolled,
	messageEvent,
	...rest
}) => {
	const [reactions, dispatch] = useReducer(reducer, []);
	const [mounted, setMounted] = useState(true);

	useEffect(() => {
		loadReactionsFromDb({
			topic,
			targetID: messageID,
		}).then(prevMessages => {
			if (!mounted) {
				return;
			}
			dispatch({ type: 'old', payload: prevMessages });
		});
		return () => {
			setMounted(false);
		};
	}, [mounted, messageID]);

	useEffect(() => {
		stayScrolled();
	}, [reactions]);

	useEffect(() => {
		if (
			!mounted
			|| !messageEvent.reaction
			|| !topic
			|| topic !== messageEvent.topic
			|| messageEvent.reaction.targetID !== messageID
		) {
			return;
		}

		dispatch({
			type: 'new',
			payload: messageEvent.reaction,
		});
	}, [messageEvent, topic, mounted, messageID]);

	return (
		<ReactionsComponent
			reactions={reactions}
			{...rest}
		/>
	);
};

const mapStateToProps = state => ({
	messageEvent: state.messageEvent,
});

export default connect(mapStateToProps)(Reactions);
