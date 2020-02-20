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
import MessageActions from 'Approot/UI/containers/Chatroom/MessageActions';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

/**
 * Message contents have been sanitized on arrival.
 * See `workers/nkn/IncomingMessage.js`
 */
const MessageContent = ({ message, stayScrolled }) => {
	const isMedia = message.contentType === 'media';
	const deleted = message.deleted && !message.isNotConfirmed;

	if (deleted) {
		return (
			<div className="content">
				<p>
					<span className="has-text-danger is-italic">
						&lt;&nbsp;{__('Deleted message.')}&nbsp;&gt;
					</span>
				</p>
			</div>
		);
	} else if (isMedia) {
		return (
			<MediaMessage
				content={message.content}
				stayScrolled={stayScrolled}
				attachments={message.attachments || []}
			/>
		);
	}

	return (
		<div
			className="content"
			dangerouslySetInnerHTML={{ __html: message.content || '' }}
		></div>
	);
};

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
				title={__('Click to @mention')}
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
	children,
	className,
	includeHeader,
	isNotice,
	isSubscribed,
	message,
	refer,
	stayScrolled,
}) => {
	const unsubscribed = !isSubscribed;
	const awaitsDeletion = message.deleted && message.isNotConfirmed;
	return (
		<div
			className={classnames(`message ${className}`, {
				'has-background-grey-lighter': isNotice,
				'x-notice': isNotice,
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
								<span className="x-is-margin-left x-toolbar">
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

			<div className={classnames('message-body x-is-small-padding', {
				'has-text-danger': awaitsDeletion,
			})}>
				<MessageContent message={message} stayScrolled={stayScrolled} />
				{children /* Reactions */}
				<div className="x-message-toolbar-side x-is-hover">
					<MessageActions
						message={message}
					/>
				</div>
			</div>
		</div>
	);
};

export default Message;
