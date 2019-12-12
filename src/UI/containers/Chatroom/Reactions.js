import React, { useEffect, useReducer } from 'react';
import useTimeout from '@rooks/use-timeout';
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
	const { start } = useTimeout(() => stayScrolled(), 0);

	useEffect(() => {
		loadReactionsFromDb({
			topic,
			targetID: messageID,
		}).then(prevMessages => {
			dispatch({ type: 'old', payload: prevMessages });
			stayScrolled();
		});
	}, [messageID]);

	useEffect(() => {
		if (
			!messageEvent.reaction
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
		start();
	}, [messageEvent, topic, messageID]);

	return (
		<ReactionsComponent
			reactions={reactions}
			{...rest}
		/>
	);
};

const mapStateToProps = (state) => ({
	messageEvent: state.messageEvent,
});

export default connect(mapStateToProps)(Reactions);
