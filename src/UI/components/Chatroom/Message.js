/**
 * Displays a chat message.
 */

import React from 'react';
import classnames from 'classnames';
import Toolbar from './MessageToolbar';
import SubscribeOffer, {
	DeleteMessageButton,
} from 'Approot/UI/containers/SubscribeOfferMessage';
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
		const isNotice = ['dchat/subscribe', 'dchat/offerSubscribe'].includes(
			message.contentType,
		);

		return (
			<div
				className={classnames(`message ${className}`, {
					'has-background-grey-lighter': isGreyed,
					'x-notice': isGreyed,
				})}
			>
				<div className="message-header is-paddingless has-text-weight-light">
					<div className="level is-marginless is-paddingless">
						<div className="level-left">
							<div className="level-item">
								<Nickname
									refer={refer}
									addr={message.addr}
									username={message.username}
									timestamp={message.timestamp}
									unsubscribed={unsubscribed}
									pubKey={message.pubKey || ''}
								/>
							</div>
							{!(isOfferSubscribe || isNotice) && (
								<div className="level-item">
									<Toolbar
										id={message.id}
										topic={topic}
										addr={message.addr}
										topic={topic}
									/>
								</div>
							)}
						</div>
					</div>
					{(isOfferSubscribe || isNotice) && (
						<DeleteMessageButton id={message.id} topic={topic} />
					)}
				</div>
				{isOfferSubscribe ? (
					<SubscribeOffer
						topic={topic}
						timestamp={message.timestamp}
						content={message.content}
						id={message.id}
					/>
				) : (
					<div className="message-body x-is-small-padding">
						{/* Message contents are sanitized on arrival. See `workers/nkn/IncomingMessage.js` */}
						<div
							className="content"
							dangerouslySetInnerHTML={{ __html: message.content }}
						></div>
						{children}
					</div>
				)}
			</div>
		);
	}
}

export default Message;
