import React from 'react';
import classnames from 'classnames';

const Reactions = ({ reactions, addReaction }) => {
	const countedReactions = reactions.reduce((acc, reaction) => {
		if (!reaction.content) {
			return acc;
		}

		const same = acc.findIndex(r => r.content == reaction.content);
		if (same !== -1) {
			acc[same]._count += 1;
			acc[same]._title += `, ${reaction.username}.${reaction.pubKey?.slice(0, 8)}`;
			return acc;
		}

		return acc.concat({
			...reaction,
			_count: 1,
			_title: `${reaction.username}.${reaction.pubKey?.slice(0, 8)}`
		});
	}, []);

	return (
		<div className="buttons are-small x-are-very-rounded x-reactions">
			{countedReactions.map((reaction, idx) => (
				<a
					title={reaction._title.slice(0, 100)}
					className={classnames('button is-primary is-outlined', {
					})}
					onClick={() => addReaction({content: reaction.content})}
					key={idx}
				>
					<span>
						{reaction.content}
					</span>
					<span className="x-is-padding-left">{reaction._count}</span>
				</a>
			))}
		</div>
	);
};

export default Reactions;
