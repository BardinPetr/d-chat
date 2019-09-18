/**
 * Displays a chat message.
 */

import React from 'react';
import TimeAgo from 'react-timeago';
import Markdown from './Markdown';
import { __ } from 'Approot/misc/browser-util';
import classnames from 'classnames';
import Toolbar from './MessageToolbar';

const formatTime = (n, unit, ago, _, defaultFormatter) => {
	if (unit === 'second') {
		if (n < 30) {
			return `${__('< 30 s')} ${ago}`;
		} else {
			return `${__('< 1 min')} ${ago}`;
		}
	}
	return defaultFormatter();
};

const Nickname = ({
	addr,
	refer,
	timestamp,
	username,
	unsubscribed,
	pubKey,
}) => (
	<span>
		<span
			onClick={() => refer(addr)}
			className={classnames('x-avatar', {
				'has-text-grey': unsubscribed,
			})}
		>
			<span className="">{username}</span>
			{username ? '.' : ''}
			<i className="is-size-7 has-text-weight-normal">
				{pubKey.slice(0, 8)}
			</i>{' '}
		</span>
		<span className="has-text-grey is-size-7 x-is-padding-left">
			<TimeAgo
				formatter={formatTime}
				title={new Date(timestamp).toLocaleString()}
				date={timestamp}
				minPeriod={30}
			/>
		</span>
	</span>
);

class Message extends React.PureComponent {
	render() {
		const {
			topic,
			refer,
			message,
			isSubscribed,
			className,
			children,
			imagesLoaded,
		} = this.props;
		const unsubscribed = !isSubscribed;

		const isNotice = ['dchat/subscribe'].includes(message.contentType);
		const { error } = message;

		return (
			<div
				className={classnames(`message ${className}`, {
					'has-background-grey-lighter': isNotice,
					'x-notice': isNotice,
				})}
			>
				<div className="message-header is-paddingless has-text-weight-light">
					<span>
						<Nickname
							refer={refer}
							addr={message.addr}
							username={message.username}
							timestamp={message.timestamp}
							unsubscribed={unsubscribed}
							pubKey={message.pubKey || ''}
						/>
					</span>
					<div className="is-pulled-right">
						<Toolbar
							id={message.id}
							topic={topic}
							addr={message.addr}
							topic={topic}
						/>
					</div>
				</div>
				<div className="message-body x-is-small-padding">
					<Markdown source={message.content} imagesLoaded={imagesLoaded} />
					{children}
				</div>
				{error && <div className="tag is-danger">{error}</div>}
			</div>
		);
	}
}

export default Message;
