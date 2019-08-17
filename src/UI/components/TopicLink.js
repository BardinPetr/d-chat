import React from 'react';
import { getChatNameForURL, getChatDisplayName } from 'Approot/misc/util';
import { Link } from 'react-router-dom';

const TopicLink = ({ topic, children }) => (
	<Link to={`/chat/${getChatNameForURL(topic)}`}>
		{children ? children : getChatDisplayName(topic)}
	</Link>
);

export default TopicLink;
