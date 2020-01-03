import React from 'react';
import { NavLink } from 'react-router-dom';
import { getChatURL, getChatDisplayName } from 'Approot/misc/util';

const TopicLink = ({ topic, children, className = '', activeClassName = 'is-active' }) => (
	<NavLink to={getChatURL(topic)} className={className} activeClassName={activeClassName}>
		{children ? children : getChatDisplayName(topic)}
	</NavLink>
);

export default TopicLink;
