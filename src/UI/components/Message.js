/**
 * Displays a message box.
 */

import React from 'react';
import TimeAgo from 'react-timeago';
import 'rc-tooltip/assets/bootstrap.css';
import Markdown from './Markdown';
import prettyMs from 'pretty-ms';
import isNumber from 'is-number';
import { __ } from 'Approot/misc/util';
import classnames from 'classnames';
import TipJar from '../containers/TipJar';

const formatTime = (n, unit, ago, _, defaultFormatter) => {
	if ( unit === 'second' ){
		if ( n < 30 ) {
			return `${__('< 30 s')} ${ago}`;
		} else {
			return `${__('< 1 min')} ${ago}`;
		}
	}
	return defaultFormatter();
};

const Ping = ({ping}) => (
	<span className={ping < 500 ? 'ping nice' : ping < 2000 ? 'ping ok' : 'ping bad'}>{prettyMs(ping)}</span>
);

const Nickname = ({id, addr, refer, timestamp, username, ping, unsubscribed}) => (
	<span>
		<span
			title={addr + (unsubscribed ? '\n' + __('This person is not subscribed and will not receive messages.') : '')}
			onClick={() => refer(addr)}
			className={classnames('avatar', {
				unsubscribed
			})}
			data-tip
			data-for={timestamp}
			aria-describedby={id}
		>
			{username}
			{' '}
		</span>
		<span className="hint">
			<TimeAgo formatter={formatTime} title={new Date(timestamp).toLocaleString()} date={timestamp} minPeriod={5} />
			{ isNumber(ping) && <Ping ping={ping} /> }
		</span>
	</span>
);

class Message extends React.Component {
	// Otherwise the spinner will flash every time.
	state = {
		showSubscribedStatus: false
	};
	componentDidMount() {
		this.timeout = setTimeout(
			() => this.setState({ showSubscribedStatus: true }),
			1000
		);
	}
	componentWillUnmount() {
		clearTimeout(this.timeout);
	}

	render() {
		const { refer, message, isSubscribed } = this.props;
		const unsubscribed = this.state.showSubscribedStatus && !isSubscribed;
		return (
			<div>
				<span>
					<Nickname
						id={message.id}
						refer={refer}
						addr={message.addr}
						username={message.username}
						timestamp={message.timestamp}
						ping={message.ping}
						unsubscribed={unsubscribed}
					/>
					<TipJar topic={message.topic} addr={message.addr} />
				</span>
				<div className="message-content">
					<Markdown
						source={message.content}
					/>
				</div>
			</div>
		);
	}
}

export default Message;
