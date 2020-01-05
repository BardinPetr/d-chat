/**
 * Does a container for displaying chat tabs on header.
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { removeActiveTopic } from 'Approot/redux/actions';
import TopicLink from 'Approot/UI/components/TopicLink';
import { getChatDisplayName } from 'Approot/misc/util';

const ActiveTopics = ({ topics, removeActiveTopic }) => (
	<ul className="x-active-topics">
		{topics.map(topic => (
			<li key={topic._id} title={getChatDisplayName(topic._id)} className="x-topic-tab">
				<TopicLink
					topic={topic._id}
					className={classnames('x-topic-link', {
						'x-has-unread': topic.unread?.length,
					})}
					textWrapClassName="x-truncate x-truncate-limited-width x-topic-link-wrap"
				>
					<span className="delete" onClick={e => {
						e.preventDefault();
						removeActiveTopic(topic._id);
					}}></span>
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
