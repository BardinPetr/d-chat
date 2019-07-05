import React from 'react';
import TimeAgo from 'react-timeago';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';
import Markdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const timeago = ({timestamp, addr}) => (
	<span>
		<TimeAgo date={timestamp} /> at {new Date(timestamp).toLocaleTimeString()}.
		<br/>
		<span>
			{addr}
		</span>
	</span>
);

const Nickname = ({addr, timestamp, username}) => (
	<span>
		<Tooltip id={timestamp + addr} placement="right" overlay={timeago({timestamp, addr})}>
			<span>
				<span className="avatar" data-tip data-for={timestamp} aria-describedby={timestamp + addr}>
					{username}
				</span><span aria-hidden="true">: </span>
			</span>
		</Tooltip>
	</span>
);

const Message = ({ message }) => (
	<li className={message.isMe ? 'me message' : 'message'}>
		<Nickname addr={message.addr} username={message.username} timestamp={message.timestamp} />
		<div>
			<Markdown
				source={message.content}
				escapeHtml={true}
				renderers={{code: CodeBlock}}
			/>
		</div>
	</li>
);

export default Message;
