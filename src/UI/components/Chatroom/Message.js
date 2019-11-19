/**
 * Displays a chat message.
 */

import React from 'react';
import classnames from 'classnames';
import Toolbar from './MessageToolbar';
import TimeAgo from './TimeAgo';
import MediaMessage from './MediaMessage';

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
			addReaction,
			topic,
			refer,
			message,
			isSubscribed,
			className,
			includeHeader,
			children,
			isNotice,
		} = this.props;
		const unsubscribed = !isSubscribed;

		const isGreyed = ['dchat/subscribe', 'nkn/tip'].includes(
			message.contentType,
		);

		const isMedia = message.contentType === 'media';

		return (
			<div
				className={classnames(`message ${className}`, {
					'has-background-grey-lighter': isGreyed,
					'x-notice': isGreyed,
					'x-not-confirmed': message.isNotConfirmed,
				})}
			>
				{(includeHeader || isNotice) && (
					<div className="message-header is-paddingless has-text-weight-light">
						<div className="level is-mobile is-marginless is-paddingless">
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
							</div>
						</div>
					</div>
				)}

				{!isNotice && (
					<div className="x-toolbar">
						<Toolbar
							id={message.id}
							topic={topic}
							addr={message.addr}
							topic={topic}
							addReaction={content =>
								addReaction({
									content,
								})
							}
						/>
					</div>
				)}

				<div className="message-body x-is-small-padding">
					{/* Message contents are sanitized on arrival. See `workers/nkn/IncomingMessage.js` */}
					{ isMedia ?
						(
							<MediaMessage
								content={message.content}
								attachments={message.attachments || []}
							/>
						) : (
							<div
								className="content"
								dangerouslySetInnerHTML={{ __html: message.content }}
							></div>
						)
					}
					{children}
				</div>
			</div>
		);
	}
}

export default Message;
