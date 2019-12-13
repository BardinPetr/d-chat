import React from 'react';
import classnames from 'classnames';
import { isAck } from 'Approot/misc/util';

const Reaction = ({ reaction, addReaction }) => (
	<button
		title={reaction._title.slice(0, 100)}
		className={classnames('button x-has-opacity-1 button', {
			'is-primary': reaction._haveReacted,
		})}
		disabled={reaction._haveReacted}
		onClick={() => !reaction._haveReacted && addReaction({content: reaction.content})}
		type="button"
	>
		<span>
			{reaction.content}
		</span>
		<span className="x-is-padding-left">{reaction._count}</span>
	</button>
);

const Ack = () => (
	<div className="x-is-ack has-text-grey">✔</div>
);

const Reactions = ({ reactions, addReaction, myAddr }) => {
	const countedReactions = reactions.reduce((acc, reaction) => {
		if (!reaction.content) {
			return acc;
		}

		const haveReacted = reaction.addr === myAddr;

		const same = acc.findIndex(r => r.content == reaction.content);
		if (same !== -1) {

			// Only one ack.
			if (isAck(reaction)) {
				return acc;
			}

			acc[same]._count += 1;
			acc[same]._title += `, ${reaction.username}.${reaction.pubKey?.slice(0, 8)}`;
			acc[same]._haveReacted = acc[same]._haveReacted || haveReacted;
			return acc;
		}

		return acc.concat({
			...reaction,
			_isAck: isAck(reaction),
			_haveReacted: haveReacted,
			_count: 1,
			_title: `${reaction.username}.${reaction.pubKey?.slice(0, 8)}`
		});
	}, []);

	return (
		<div className="x-reactions">
			{countedReactions.map((reaction) => reaction._isAck ? (
				<Ack key={reaction.id} />
			) : (
				<Reaction reaction={reaction} addReaction={addReaction} key={reaction.id} />
			))}
		</div>
	);
};

export default Reactions;
