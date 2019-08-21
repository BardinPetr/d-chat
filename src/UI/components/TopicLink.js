import React from 'react';
import { getChatURL, getChatDisplayName } from 'Approot/misc/util';
import { Link } from 'react-router-dom';

const TopicLink = ({ topic, children, className }) => (
	<Link to={getChatURL(topic)} className={className}>
		{children ? children : getChatDisplayName(topic)}
	</Link>
);

export default TopicLink;
