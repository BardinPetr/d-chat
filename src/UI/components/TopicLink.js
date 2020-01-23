import React from 'react';
import { NavLink } from 'react-router-dom';
import {
	getChatURL,
	getChatDisplayName,
	isWhisperTopic,
	isPermissionedTopic,
	getTopicFromPathname,
} from 'Approot/misc/util';
import { IoIosPeople, IoMdPeople } from 'react-icons/io';

const TopicLink = ({ topic, children, textWrapClassName = '', className = '', activeClassName = 'is-active' }) => (
	<NavLink
		to={getChatURL(topic)}
		className={className}
		activeClassName={activeClassName}
		isActive={() => getTopicFromPathname(location.hash) === topic}
		draggable={false}
	>
		<span className={textWrapClassName}>
			{isWhisperTopic(topic) ? (
				null
			) : (
				isPermissionedTopic(topic) ? (
					<span className="icon x-topic-icon"><IoMdPeople /></span>
				) : (
					<span className="icon x-topic-icon"><IoIosPeople /></span>
				)
			)}
			<span className="x-topic-name">{getChatDisplayName(topic)}</span>
		</span>
		{children}
	</NavLink>
);

export default TopicLink;
