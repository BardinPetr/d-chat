/**
 * Does a container for displaying chat tabs on header.
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import HorizontalScroll from 'react-overflow-wrapper';

import { removeActiveTopicTab } from 'Approot/redux/actions';
import TopicLink from 'Approot/UI/components/TopicLink';
import { getChatDisplayName } from 'Approot/misc/util';

// Alternating key to make sure it updates on modifications.
const ActiveTopics = ({ topics, removeActiveTopicTab }) => (
	<HorizontalScroll key={topics.length} sensibility={300}>
		<ul className="x-active-topics">
			{topics.map(topic => (
				<li key={topic._id} title={getChatDisplayName(topic._id)} className="x-topic-tab">
					<TopicLink
						topic={topic._id}
						className={classnames('x-topic-link x-truncate x-truncate-limited-width', {
							'x-has-unread': topic.unread?.length,
						})}
					>
						<span className="x-truncate">{getChatDisplayName(topic._id)}</span>
						<span className="delete" onClick={e => {
							e.preventDefault();
							removeActiveTopicTab(topic._id);
						}}></span>
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

const mapDispatchToProps = dispatch => ({
	removeActiveTopicTab: topic => dispatch(removeActiveTopicTab(topic)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ActiveTopics);
