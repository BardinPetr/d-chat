import React from 'react';
import TimeAgo from 'react-timeago';
import ReactTooltip from 'react-tooltip';

const Nickname = ({timestamp, username}) => (
	<span>
		<span className="avatar" data-tip data-for="timeago">
			{username}
		</span><span aria-hidden="true">: </span>
		<ReactTooltip id="timeago" effect="solid">
			<TimeAgo date={timestamp} /> at {new Date(timestamp).toLocaleTimeString()}.
		</ReactTooltip>
	</span>
);

const Message = ({ message }) => (
	<li className={message.isMe ? 'me message' : 'message'}>
		<Nickname addr={message.addr} username={message.username} timestamp={message.timestamp} />
		<p>{message.content}</p>
	</li>
);

export default Message;
