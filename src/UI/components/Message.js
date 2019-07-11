import React from 'react';
import TimeAgo from 'react-timeago';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';
import Markdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import prettyMs from 'pretty-ms';
import isNumber from 'is-number';

const timeago = ({timestamp, addr}) => (
	<span>
		{new Date(timestamp).toLocaleTimeString()}.
		<br/>
		<span>
			{addr}
		</span>
	</span>
);

const Ping = ({ping}) => (
	<span className={ping < 500 ? 'ping nice' : ping < 2000 ? 'ping ok' : 'ping bad'}>{prettyMs(ping)}</span>
);

const Nickname = ({addr, timestamp, username, ping}) => (
	<span>
		<Tooltip id={timestamp + addr} placement="right" overlay={timeago({timestamp, addr})} mouseEnterDelay={0.2}>
			<span>
				<span className="avatar" data-tip data-for={timestamp} aria-describedby={timestamp + addr}>
					{username}
					{' '}
				</span>
			</span>
		</Tooltip>
		<TimeAgo date={timestamp} minPeriod={5} />
		{ isNumber(ping) && <Ping ping={ping} /> }
	</span>
);

const Message = ({ message }) => (
	<li className={message.isMe ? 'me message' : 'message'}>
		<Nickname addr={message.addr} username={message.username} timestamp={message.timestamp} ping={message.ping} />
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
