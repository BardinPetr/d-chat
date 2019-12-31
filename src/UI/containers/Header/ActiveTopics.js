/**
 * Has a small container for displaying chat tabs on header.
 * Container because Header itself is component...
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import TopicLink from 'Approot/UI/components/TopicLink';
import { getChatDisplayName } from 'Approot/misc/util';
import HorizontalScroll from 'react-overflow-wrapper';

const ActiveTopics = ({ topics }) => (
	<HorizontalScroll key={topics.length} sensibility={300}>
		<ul className="x-active-topics">
			{topics.map(topic => (
				<li key={topic._id} title={getChatDisplayName(topic._id)}>
					<TopicLink
						topic={topic._id}
						className={classnames('x-topic-link x-truncate x-truncate-limited-width', {
							'x-has-unread': topic.unread?.length,
						})}
					>
						<span className="x-truncate">{getChatDisplayName(topic._id)}</span>
					</TopicLink>
				</li>
			))}
		</ul>
	</HorizontalScroll>
);

const mapStateToProps = state => ({
	topics: Array.from(state.activeTopics).map(topic => ({
		...state.chatSettings[topic],
		_id: topic,
	})),
});

export default connect(mapStateToProps)(ActiveTopics);
