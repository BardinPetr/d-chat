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
import { parseAddr, isNotice } from 'Approot/misc/util';
import { FaRegMinusSquare, FaRegPlusSquare } from 'react-icons/fa';
import Avatar from 'Approot/UI/containers/Avatar';

/**
 * Message contents have been sanitized on arrival.
 * See `workers/nkn/IncomingMessage.js`
 */
const MessageContent = ({ message }) => {
	const isMedia = message.contentType === 'media';
	const deleted = message.deleted && !message.isNotConfirmed;
	import('highlight.js/styles/github.css');

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
	}

	return (
		<div>
			{isMedia && (
				<MediaMessage
					attachments={message.attachments || []}
				/>
			)}
			<div
				className={classnames('content x-message-content x-has-normal-scrollbar', {
					'is-size-3': message.isOnlyEmojis,
				})}
				dangerouslySetInnerHTML={{ __html: message.content || '' }}
			></div>
		</div>
	);
};

const Nickname = ({
	addr,
	ignored,
	refer,
	timestamp,
	unsubscribed,
}) => {
	const [username, pubKey] = parseAddr(addr);
	// Use selected text for quoting.
	const [text, setText] = useState('');
	const onMouseDown = () => setText(window.getSelection().toString());
	const onMention = useCallback(() => {
		refer(addr, text);
	}, [addr, text]);
	return (
		<span>
			<span
				onMouseDown={onMouseDown}
				title={__('Click to @mention')}
				onClick={onMention}
				className={classnames('x-avatar', {
					'has-text-grey': unsubscribed,
					'x-is-opaque': ignored,
				})}
			>
				<span className="x-avatar-username">{username}</span>
				{username ? '.' : ''}
				<span className="is-size-7 has-text-weight-normal is-italic">
					{pubKey?.slice(0, 8)}
				</span>{' '}
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
	message,
	refer,
	subscribed,
	ignored
}) => {
	const [showIgnored, setShowIgnored] = useState(false);
	const awaitsDeletion = message.deleted && message.isNotConfirmed;

	const toggleShowingIgnored = () => {
		setShowIgnored(showIgnored => !showIgnored);
	};

	const notice = isNotice(message);
	const showHeader = includeHeader || notice;

	return (
		<div
			className={classnames(`message ${className}`, {
				'has-background-grey-lighter': notice,
				'x-notice': notice,
				'x-not-confirmed': message.isNotConfirmed,
				'x-message-ignored': ignored,
				'x-show-ignored': showIgnored,
				'x-has-header': showHeader,
			})}
			data-not-confirmed={__('Message unconfirmed.')}
		>
			{showHeader && (
				<div className="message-header is-paddingless has-text-weight-light">
					<div className="level is-mobile is-marginless is-paddingless">
						<div className="level-left">
							<div className="level-item x-avatar-image">
								<Avatar addr={message.addr} />
							</div>
							<div className="level-item">
								{ignored && (
									<a
										className="button is-small is-text"
										title={__('Click to display')}
										onClick={toggleShowingIgnored}
									>
										<span className="icon has-text-grey x-is-opaque">
											{!showIgnored ? (
												<FaRegPlusSquare />
											) : (
												<FaRegMinusSquare />
											)}
										</span>
									</a>
								)}
								<Nickname
									refer={refer}
									addr={message.addr}
									timestamp={message.timestamp}
									unsubscribed={!subscribed}
									ignored={ignored}
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
				<MessageContent message={message} />
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
