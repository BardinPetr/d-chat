import React, { useEffect, useReducer } from 'react';
import { connect } from 'react-redux';
import ReactionsComponent from 'Approot/UI/components/Chatroom/Reactions';
import { loadReactionsFromDb } from 'Approot/database/reactions';
import uniqby from 'lodash.uniqby';

function uniqByReactions (reaction) {
	return '' + reaction.addr + reaction.content;
}

function reducer(state, action) {
	const changes = action.payload;
	switch(action.type) {
		case 'new':
			return uniqby([...state, changes], uniqByReactions);

		case 'old':
			return uniqby([...changes, ...state], uniqByReactions);
	}
}

const Reactions = ({
	topic,
	messageID,
	messageEvent,
	...rest
}) => {
	const [reactions, dispatch] = useReducer(reducer, []);

	useEffect(() => {
		let mounted = true;
		loadReactionsFromDb({
			topic,
			targetID: messageID,
		}).then(prevMessages => {
			if (mounted) {
				dispatch({ type: 'old', payload: prevMessages });
				window.stayScrolled();
			}
		});

		return () => {
			mounted = false;
		};
	}, [messageID]);

	useEffect(() => {
		if (
			!messageEvent.reaction
			|| messageEvent.type !== 'new'
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
