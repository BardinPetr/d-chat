import React, { useState, useEffect, useReducer } from 'react';
import useTimeout from '@rooks/use-timeout';
import { connect } from 'react-redux';
import ReactionsComponent from 'Approot/UI/components/Chatroom/Reactions';
import { loadReactionsFromDb } from 'Approot/database/reactions';
import { emojiIndex } from 'emoji-mart';

function getMostUsedReaction() {
	let mostUsed = '+1';
	try {
		// This is an object like `{ "reaction_code": noOfUses }`.
		const reactions = JSON.parse(localStorage.getItem('emoji-mart.frequently'));
		let n;
		for (const reaction in reactions) {
			const count = reactions[reaction];
			if (!n || count > reactions[n]) {
				n = reaction;
			}
		}

		mostUsed = n;
	} catch(e) {}

	const e = emojiIndex.emojis[mostUsed];
	return e?.native || e?.['1']?.native || '👍';
}

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
	const [mounted, setMounted] = useState(false);
	const [reactions, dispatch] = useReducer(reducer, []);
	const { start } = useTimeout(() => mounted && stayScrolled(), 0, [mounted]);
	const [initialReaction] = useState(getMostUsedReaction());

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
				stayScrolled();
			}
		});
	}, [messageID, mounted]);

	useEffect(() => {
		if (
			!messageEvent.reaction
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
		start();
	}, [messageEvent, topic, messageID, mounted]);

	return (
		<ReactionsComponent
			reactions={reactions}
			initialReaction={initialReaction}
			{...rest}
		/>
	);
};

const mapStateToProps = (state) => ({
	messageEvent: state.messageEvent,
});

export default connect(mapStateToProps)(Reactions);
