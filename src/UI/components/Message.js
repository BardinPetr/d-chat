/**
 * Displays a message box.
 */

import React from 'react';
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
		return (
			<div>
				<span>
					<Nickname id={message.id} refer={refer} addr={message.addr} username={message.username} timestamp={message.timestamp} ping={message.ping} />
					{ this.state.showSubscribedStatus && !isSubscribed && <i className="loader margin-left dark" title={__('This person still subscribing')} /> }
				</span>
				<div>
					<Markdown
						source={message.content}
						escapeHtml={true}
						renderers={{code: CodeBlock}}
					/>
				</div>
			</div>
		);
	}
}

export default Message;
