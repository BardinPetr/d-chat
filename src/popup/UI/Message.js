import React from 'react';

const Nickname = ({timestamp, username}) => (
	<span>
		<span className="avatar" title={new Date(timestamp).toLocaleTimeString()}>
			{username}
		</span><span aria-hidden="true">: </span>
	</span>
);

const Message = ({ message }) => (
	<li className={message.isMe ? 'me message' : 'message'}>
		<Nickname addr={message.addr} username={message.username} timestamp={message.timestamp} />
		<p>{message.content}</p>
	</li>
);

export default Message;
