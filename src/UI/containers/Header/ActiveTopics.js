/**
 * Does a container for displaying chat tabs on header.
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { removeActiveTopic } from 'Approot/redux/actions';
import TopicLink from 'Approot/UI/components/TopicLink';
import { getChatDisplayName } from 'Approot/misc/util';

const ActiveTopics = ({ topics, removeActiveTopicTab }) => (
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
					<span className="delete" onClick={() => removeActiveTopicTab(topic._id)}></span>
				</TopicLink>
			</li>
		))}
		<li className="x-topic-tab x-topic-tab-ghost"></li>
	</ul>
);

const mapStateToProps = state => ({
	topics: state.activeTopics.map(topic => ({
		...state.chatSettings[topic],
		_id: topic,
	})),
});

const mapDispatchToProps = dispatch => ({
	removeActiveTopic: topic => dispatch(removeActiveTopic(topic)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ActiveTopics);
