/**
 * Does a container for displaying chat tabs on header.
 */
import React, { useRef, useLayoutEffect } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { removeActiveTopic } from 'Approot/redux/actions';
import TopicLink from 'Approot/UI/components/TopicLink';
import { getChatDisplayName, getTopicFromPathname } from 'Approot/misc/util';

const Topic = ({ removeActiveTopic, isActive, topic }) => {
	const ref = useRef();
	useLayoutEffect(() => {
		if (!isActive) {
			return;
		}
		ref.current?.scrollIntoView({ inline: 'center' });
	}, [isActive]);
	return (
		<li
			ref={ref}
			key={topic._id}
			title={getChatDisplayName(topic._id)}
			className="x-topic-tab"
		>
			<TopicLink
				topic={topic._id}
				className={classnames('x-topic-link', {
					'x-has-unread': topic.unread?.length,
				})}
				textWrapClassName="x-is-fullwidth x-truncate x-truncate-limited-width x-topic-link-wrap"
			>
				<span className="delete" onClick={removeActiveTopic}></span>
			</TopicLink>
		</li>
	);
};

const ActiveTopics = ({ topics, removeActiveTopic, currentTopic }) => {
	return (
		<ul className="x-active-topics">
			{topics.map(topic => (
				<Topic
					key={topic._id}
					isActive={topic._id === currentTopic}
					topic={topic}
					removeActiveTopic={e => {
						e.preventDefault();
						removeActiveTopic(topic._id);
					}}
				/>
			))}
			<li className="x-topic-tab x-topic-tab-ghost"></li>
		</ul>
	);
};

const mapStateToProps = state => ({
	topics: state.activeTopics.map(topic => ({
		...state.chatSettings[topic],
		_id: topic,
	})),
	currentTopic: getTopicFromPathname(location.hash),
});

const mapDispatchToProps = dispatch => ({
	removeActiveTopic: topic => dispatch(removeActiveTopic(topic)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ActiveTopics);
