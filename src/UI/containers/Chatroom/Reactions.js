import React, { useEffect, useReducer } from 'react';
import ReactionsComponent from 'Approot/UI/components/Chatroom/Reactions';
import { loadReactionsFromDb, subscribeToReactions } from 'Approot/database/reactions';

function reducer( state, action ) {

	const changes = action.payload;
	switch( action.type ) {
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
	...rest
}) => {
	const [reactions, dispatch] = useReducer( reducer, [] );

	useEffect(() => {
		const loading = loadReactionsFromDb({
			topic,
			targetID: messageID,
		});
		loading.then( prevMessages => {
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
	}, [] );

	return (
		<ReactionsComponent
			reactions={reactions}
			{...rest}
		/>
	);
};

export default Reactions;
