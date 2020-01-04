import React from 'react';
import { NavLink } from 'react-router-dom';
import { getChatURL, getChatDisplayName, isWhisperTopic } from 'Approot/misc/util';
import { IoIosPeople } from 'react-icons/io';

const TopicLink = ({ topic, children, className = '', activeClassName = 'is-active' }) => (
	<NavLink to={getChatURL(topic)} className={className} activeClassName={activeClassName}>
		<span>
			{!isWhisperTopic(topic) ? (
				<span className="icon x-topic-icon"><IoIosPeople /></span>
			): null}
			<span>{getChatDisplayName(topic)}</span>
		</span>
		{children}
	</NavLink>
);

export default TopicLink;
