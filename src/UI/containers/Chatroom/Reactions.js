import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

const Reactions = ({ topic, reactions, myAddr, createMessage }) => {
	const countedReactions = reactions.reduce((acc, reaction) => {
		const same = acc.findIndex(r => r.content == reaction.content);
		if (same !== -1) {
			acc[same]._count += 1;
			acc[same]._title += `, ${reaction.username || 'anon'}`;
			return acc;
		}

		return acc.concat({
			...reaction,
			_count: 1,
			_title: `${reaction.username || 'anon'}`
		});
	}, []);

	const haveReacted = reactions.some(r => r.addr === myAddr);

	return (
		<div className="buttons are-small x-are-very-rounded x-reactions">
			{countedReactions.map((reaction, idx) => (
				<a
					title={reaction._title.slice(0, 100)}
					className={classnames('button is-primary is-outlined', {
						'has-background-info': haveReacted,
					})}
					disabled={haveReacted}
					onClick={() => createMessage({
						topic,
						targetID: reaction.targetID,
						contentType: 'reaction',
						content: reaction.content,
					})}
					style={{opacity: 1}}
					key={idx}
				>
					{/* Content is sanitized on arrival. See workers/nkn/IncomingMessage.js. */}
					<span dangerouslySetInnerHTML={{__html: reaction.content}}></span>
					<span className="x-is-padding-left">{reaction._count}</span>
				</a>
			))}
		</div>
	);
};

const mapStateToProps = state => ({
	myAddr: state.login?.addr,
});

export default connect(mapStateToProps)(Reactions);