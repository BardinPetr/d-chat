import React from 'react';
import { getChatNameForURL, getChatDisplayName } from 'Approot/misc/util';
import { Link } from 'react-router-dom';

const TopicLink = ({ topic }) => (
	<Link to={`/chat/${getChatNameForURL(topic)}`}>
		{getChatDisplayName(topic)}
	</Link>
);

export default TopicLink;
