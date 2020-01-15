/**
 * Displays a chat message.
 *
 * Maybe remove the message-not-confirmed, and use same style as whispers.
 */

import React, { useState, useCallback } from 'react';
import classnames from 'classnames';
import TimeAgo from './TimeAgo';
import MediaMessage from './MediaMessage';
import MessageToolbar from './MessageToolbar';

const Nickname = ({
	addr,
	refer,
	timestamp,
	username,
	unsubscribed,
	pubKey,
}) => {
	// Use selected text for quoting.
	const [text, setText] = useState('');
	const onMouseDown = () => setText(window.getSelection().toString());
	const onClick= useCallback(() => {
		refer(addr, text);
	}, [addr, text]);
	return (
		<span>
			<span
				onMouseDown={onMouseDown}
				onClick={onClick}
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
};

const Message = ({
	refer,
	message,
	isSubscribed,
	className,
	includeHeader,
	children,
	isNotice,
}) => {
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
								<span className="x-is-hover x-is-margin-left x-toolbar">
									<MessageToolbar
										id={message.id}
										topic={message.topic}
										addr={message.addr}
									/>
								</span>
							</div>
						</div>
					</div>
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
};

export default Message;
