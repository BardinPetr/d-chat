import React, { useEffect, useReducer } from 'react';
import uniqBy from 'lodash.uniqby';
import ReactionsComponent from 'Approot/UI/components/Chatroom/Reactions';
import { loadReactionsFromDb, subscribeToReactions } from 'Approot/database/reactions';

function reducer(state, action) {

	const changes = action.payload;
	switch(action.type) {
		case 'new':
			// Our own reactions get received twice.
			// This is the easiest solution, and considering -
			// the array is always quite small, it's alright.
			return uniqBy([...state, changes], 'id');

		case 'old':
			return [...changes, ...state];
	}
}

const Reactions = ({
	topic,
	messageID,
	stayScrolled,
	...rest
}) => {
	const [reactions, dispatch] = useReducer(reducer, []);

	useEffect(() => {
		loadReactionsFromDb({
			topic,
			targetID: messageID,
		}).then(prevMessages => {
			dispatch({ type: 'old', payload: prevMessages });
			stayScrolled();
		});

		const unsub = subscribeToReactions({
			topic,
			targetID: messageID,
		}, reaction => {
			dispatch({ type: 'new', payload: reaction });
			stayScrolled();
		});

		return () => {
			unsub();
		};
	}, []);

	return (
		<ReactionsComponent
			reactions={reactions}
			{...rest}
		/>
	);
};

export default Reactions;
