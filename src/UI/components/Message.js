import React from 'react';
import classnames from 'classnames';
import TimeAgo from 'react-timeago';
import 'rc-tooltip/assets/bootstrap.css';
import Markdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import prettyMs from 'pretty-ms';
import isNumber from 'is-number';
import { __ } from 'Approot/misc/util';

const Ping = ({ping}) => (
	<span className={ping < 500 ? 'ping nice' : ping < 2000 ? 'ping ok' : 'ping bad'}>{prettyMs(ping)}</span>
);

const Nickname = ({id, addr, refer, timestamp, username, ping}) => (
	<span>
		<span title={addr} onClick={() => refer(addr)} className="avatar" data-tip data-for={timestamp} aria-describedby={id}>
			{username}
			{' '}
		</span>
		<TimeAgo title={new Date(timestamp).toLocaleString()} date={timestamp} minPeriod={5} />
		{ isNumber(ping) && <Ping ping={ping} /> }
	</span>
);

const Message = ({ refer, message, refersToMe, isSubscribed }) => (
	<li className={classnames('message', {
		me: message.isMe,
		'refers-to-me': refersToMe,
	})}>
		<span>
			{ !isSubscribed && <i className="loader loader-margin dark" title={__('This person still subscribing')} /> }
			<Nickname id={message.id} refer={refer} addr={message.addr} username={message.username} timestamp={message.timestamp} ping={message.ping} />
		</span>
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
