/**
 * Displays a message box.
 */

import React from 'react';
import TimeAgo from 'react-timeago';
import Markdown from './Markdown';
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

const Nickname = ({addr, refer, timestamp, username, unsubscribed, pubKey}) => (
	<span>
		<span
			title={addr + (unsubscribed ? ('\n' + __('This person is not subscribed and will not receive messages.')) : '')}
			onClick={() => refer(addr)}
			className={classnames('x-avatar', {
				'has-text-grey': unsubscribed
			})}
		>
			<span className="">{username}{username ? '.' : ''}</span>
			<i className="is-size-7 has-text-weight-normal">{pubKey.slice(0, 8)}</i>
			{' '}
		</span>
		<span className="has-text-grey is-size-7">
			<TimeAgo formatter={formatTime} title={new Date(timestamp).toLocaleString()} date={timestamp} minPeriod={30} />
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
		const { refer, message, isSubscribed, className, isNotice } = this.props;
		const unsubscribed = this.state.showSubscribedStatus && !isSubscribed;

		return (
			<div className={`message ${isNotice ? 'has-background-grey-lighter' : ''} ${className}`}>
				<div className="message-header is-paddingless has-text-weight-light">
					<Nickname
						refer={refer}
						addr={message.addr}
						username={message.username}
						timestamp={message.timestamp}
						unsubscribed={unsubscribed}
						pubKey={message.pubKey || ''}
					/>
					<TipJar className={classnames('', {
						'is-hidden': isNotice,
					})} messageID={message.id} topic={message.topic} addr={message.addr} />
				</div>
				<div className="message-body x-is-small-padding">
					<Markdown
						source={message.content}
					/>
				</div>
			</div>
		);
	}
}

export default Message;
