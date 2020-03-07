import React, { useState, useEffect, useReducer } from 'react';
import { connect } from 'react-redux';
import ReactionsComponent from 'Approot/UI/components/Chatroom/Reactions';
import { loadReactionsFromDb } from 'Approot/database/reactions';
import uniqby from 'lodash.uniqby';

function reducer(state, action) {
	const changes = action.payload;
	switch(action.type) {
		case 'new':
			return uniqby([...state, changes], 'id');

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
	const [mounted, setMounted] = useState(false);
	const [reactions, dispatch] = useReducer(reducer, []);

	useEffect(() => {
		setMounted(true);
		return () => {
			setMounted(false);
		};
	}, []);

	useEffect(() => {
		loadReactionsFromDb({
			topic,
			targetID: messageID,
		}).then(prevMessages => {
			if (mounted) {
				dispatch({ type: 'old', payload: prevMessages });
			}
		});
	}, [messageID, mounted]);

	useEffect(() => {
		if (
			!messageEvent.reaction
			|| messageEvent.type !== 'new'
			|| !mounted
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
	}, [messageEvent, topic, messageID, mounted]);

	return (
		<ReactionsComponent
			reactions={reactions}
			stayScrolled={stayScrolled}
			{...rest}
		/>
	);
};

const mapStateToProps = (state) => ({
	messageEvent: state.messageEvent,
});

export default connect(mapStateToProps)(Reactions);
