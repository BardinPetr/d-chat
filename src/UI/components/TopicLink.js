import React from 'react';
import { NavLink } from 'react-router-dom';
import { getChatURL, getChatDisplayName, isWhisperTopic, getTopicFromPathname } from 'Approot/misc/util';
import { IoIosPeople } from 'react-icons/io';

// Again using location.hash instead of the history. See Header.
const TopicLink = ({ topic, children, textWrapClassName = '', className = '', activeClassName = 'is-active' }) => (
	<NavLink
		to={getChatURL(topic)}
		className={className}
		activeClassName={activeClassName}
		isActive={() => getTopicFromPathname(location.hash) === topic}
	>
		<span className={textWrapClassName}>
			{!isWhisperTopic(topic) ? (
				<span className="icon x-topic-icon"><IoIosPeople /></span>
			): null}
			<span>{getChatDisplayName(topic)}</span>
		</span>
		{children}
	</NavLink>
);

export default TopicLink;
