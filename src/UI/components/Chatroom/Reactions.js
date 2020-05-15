import React, { useMemo } from 'react';
import classnames from 'classnames';
import { isAck, formatAddr } from 'Approot/misc/util';

const Reaction = ({ reaction, addReaction }) => {
	const reactionBtn = (
		<button
			title={reaction._title.slice(0, 100)}
			className={classnames('button x-has-opacity-1 button', {
				'is-primary': reaction._haveReacted,
				'x-reactions-reacted': reaction._haveReacted,
			})}
			disabled={reaction._haveReacted}
			onClick={() => !reaction._haveReacted && addReaction({content: reaction.content})}
			type="button"
		>
			<span className="x-reaction-content">
				{reaction.content}
			</span>
			{reaction._count > 0 && (
				<span className="x-is-padding-left">{reaction._count}</span>
			)}
		</button>
	);

	return reactionBtn;
};

const Ack = () => (
	<div className="x-is-ack has-text-grey is-family-monospace">✔</div>
);

const Reactions = ({
	addReaction,
	myAddr,
	reactions,
}) => {
	const countedReactions = useMemo(() => reactions.reduce((acc, reaction) => {
		if (!reaction.content) {
			return acc;
		}

		const haveReacted = reaction.addr === myAddr;
		const content = reaction.content;
		const title = formatAddr(reaction.addr);

		const same = acc[content];
		if (same) {
			// Only one ack.
			if (isAck(reaction)) {
				return acc;
			}

			same._count += 1;
			same._title += (same._title == '') ? title : `, ${title}`;
			same._haveReacted = same._haveReacted || haveReacted;
			return acc;
		}

		acc[content] = {
			content: content || '?',
			_isAck: isAck(reaction),
			_haveReacted: haveReacted,
			_count: 1,
			_title: title,
		};
		return acc;
	}, {}),
	[reactions, myAddr]
	);

	return (
		<div className="x-reactions">
			{Object.values(countedReactions).map((reaction) => reaction._isAck ? (
				<Ack key={reaction.content} />
			) : (
				<Reaction
					reaction={reaction}
					addReaction={addReaction}
					key={reaction.content}
				/>
			))}
		</div>
	);
};

export default Reactions;
