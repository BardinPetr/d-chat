/**
 * Displays a chat message.
 */

import React from 'react';
import { __ } from 'Approot/misc/browser-util';
import classnames from 'classnames';
import Toolbar from './MessageToolbar';
import SubscribeOffer from 'Approot/UI/containers/SubscribeOfferMessage';
import TimeAgo from './TimeAgo';

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
			<TimeAgo date={timestamp} />
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
		} = this.props;
		const unsubscribed = !isSubscribed;

		const isGreyed = [
			'dchat/subscribe',
			'dchat/offerSubscribe',
			'nkn/tip',
		].includes(message.contentType);
		const isOfferSubscribe = ['dchat/offerSubscribe'].includes(
			message.contentType,
		);
		const { error } = message;

		return (
			<div
				className={classnames(`message ${className}`, {
					'has-background-grey-lighter': isGreyed,
					'x-notice': isGreyed,
					'box': isOfferSubscribe,
				})}
			>
				{isOfferSubscribe ? (
					<SubscribeOffer topic={topic} timestamp={message.timestamp} id={message.id} content={message.content} />
				) : (
					<React.Fragment>
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
							{/* Message contents are sanitized on arrival. See `workers/nkn/IncomingMessage.js` */}
							<div
								className="content"
								dangerouslySetInnerHTML={{ __html: message.content }}
							></div>
							{children}
						</div>
						{error && <div className="tag is-danger">{error}</div>}
					</React.Fragment>
				)}
			</div>
		);
	}
}

export default Message;
