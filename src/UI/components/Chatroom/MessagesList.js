import React, { useRef, useEffect, useMemo } from 'react';
import classnames from 'classnames';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import Reactions from 'Approot/UI/containers/Chatroom/Reactions';
import Message from 'Approot/UI/components/Chatroom/Message';
import { isNotice, isWhisper, mention, formatAddr } from 'Approot/misc/util';

// 1min 30seconds seconds.
const SEPARATE_MESSAGE_TIME = (60 + 30) * 1000;

const LastRead = () => {
	const lastReadRef = useRef();
	useEffect(() => {
		lastReadRef.current?.scrollIntoView();
	}, []);
	// The extra div makes the divider be fully in view when it is scrolledIntoView.
	return (
		<React.Fragment>
			<div style={{ paddingBottom: '0.5rem' }} ref={lastReadRef} />
			<div style={{ marginTop: '0.5rem' }} className="is-divider" data-content={__('New messages below')} />
		</React.Fragment>
	);
};

const MessagesList = ({
	messages = [],
	refer,
	lastReadId,
	myAddr,
	createReaction,
	mutedUsers = [],
	subs = [],
}) => {
	const messagesList = useMemo(() => {
		const messagesList = [];

		// Start a bundle of messages.
		for (let i = 0; i < messages.length; i++) {
			let includeHeader = true;
			let previousMessage;
			const messagePackKey = messages[i].id || i;
			const messagesPack = [];

			// Gather the messages that belong to this bundle.
			while (i < messages.length) {
				const message = messages[i];
				const messageIsNotice = isNotice(message);

				if (previousMessage) {
					// Same sender, max n minutes apart.
					if (
						!isNotice(previousMessage) &&
						!messageIsNotice &&
						previousMessage.addr === message.addr &&
						new Date(message.timestamp) - new Date(previousMessage.timestamp) <
							SEPARATE_MESSAGE_TIME
					) {
						includeHeader = false;
					} else {
						i--;
						break;
					}
				}

				// Don't want to lose the "last read" indicator after new messages arrive.
				const lrId = lastReadId;
				if (message.id === lrId) {
					messagesPack.push(<LastRead key={'lastRead'} />);
				}

				const addReaction = msg =>
					createReaction({
						...msg,
						targetID: message.id,
					});

				previousMessage = message;

				// Check dynamically, otherwise changing accounts makes them go wrong.
				const isMe = message.addr === myAddr;
				const refersToMe = !isMe && message.content?.includes(
					messageIsNotice ? formatAddr(myAddr) : mention(myAddr)
				);
				// If message isn't permissioned, it is marked `hidden`, and then we hide it.
				const isIgnored = mutedUsers.includes(message.addr) || message.hidden;
				const isSubscribed = isWhisper(message) || subs.includes(message.addr);

				messagesPack.push(
					<Message
						className={classnames('is-relative', {
							'x-me': isMe,
							'x-refers-to-me': refersToMe,
						})}
						includeHeader={includeHeader}
						refer={refer}
						message={message}
						key={message.id}
						topic={message.topic}
						addReaction={addReaction}
						subscribed={isSubscribed}
						ignored={isIgnored}
					>
						<Reactions
							addReaction={addReaction}
							myAddr={myAddr}
							messageID={message.id}
							topic={message.topic}
						/>
					</Message>
				);
				i++;
			}
			messagesList.push(
				<div key={'pack-' + messagePackKey} className="x-message-bundle">
					{messagesPack}
				</div>
			);
		}
		return messagesList;
	}, [messages, subs, lastReadId]);

	return messagesList;
};

export default MessagesList;
