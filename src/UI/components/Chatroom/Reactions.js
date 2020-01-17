import React from 'react';
import classnames from 'classnames';
import { isAck } from 'Approot/misc/util';

const Reaction = ({ reaction, addReaction }) => (
	<button
		title={reaction._title.slice(0, 100)}
		className={classnames('button x-has-opacity-1 button', {
			'is-primary': reaction._haveReacted,
			'x-is-first-reaction': reaction._count === 0,
			'is-rounded': reaction._count === 0,
			'x-is-hover': reaction._count === 0,
		})}
		disabled={reaction._haveReacted}
		onClick={() => !reaction._haveReacted && addReaction({content: reaction.content})}
		type="button"
	>
		<span>
			{reaction.content}
		</span>
		{reaction._count > 0 && (
			<span className="x-is-padding-left">{reaction._count}</span>
		)}
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
		const content = reaction.content;

		const same = acc[content];
		if (same) {
			// Only one ack.
			if (isAck(reaction)) {
				return acc;
			}

			same._count += 1;
			same._title += `, ${reaction.username}.${reaction.pubKey?.slice(0, 8)}`;
			same._haveReacted = same._haveReacted || haveReacted;
			return acc;
		}

		return acc[content] = {
			content: content || 'x',
			_isAck: isAck(reaction),
			_haveReacted: haveReacted,
			_count: 1,
			_title: `${reaction.username}.${reaction.pubKey?.slice(0, 8)}`
		};
	}, {
		'👍': {
			content: '👍',
			_isAck: false,
			_count: 0,
			_title: '',
			_haveReacted: false,
		}
	});

	return (
		<div className="x-reactions">
			{Object.values(countedReactions).map((reaction) => reaction._isAck ? (
				<Ack key={reaction.content} />
			) : (
				<Reaction reaction={reaction} addReaction={addReaction} key={reaction.content} />
			))}
		</div>
	);
};

export default Reactions;
