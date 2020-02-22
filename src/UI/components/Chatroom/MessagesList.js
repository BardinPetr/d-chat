import React, { useRef, useEffect, useMemo } from 'react';
import useTimeout from '@rooks/use-timeout';
import classnames from 'classnames';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import Reactions from 'Approot/UI/containers/Chatroom/Reactions';
import Message from 'Approot/UI/containers/Chatroom/Message';
import { isNotice, formatAddr } from 'Approot/misc/util';

// 1min 30seconds seconds.
const SEPARATE_MESSAGE_TIME = (60 + 30) * 1000;

const LastRead = () => {
	const lastReadRef = useRef();
	const { start } = useTimeout(() => lastReadRef.current.scrollIntoView(), 100, []);
	useEffect(() => {
		start();
	}, []);
	// The extra div makes the divider be fully in view when it is scrolledIntoView.
	return (
		<React.Fragment>
			<div style={{ marginBottom: '1rem' }} ref={lastReadRef} />
			<div className="is-divider" data-content={__('New messages below')} />
		</React.Fragment>
	);
};

const MessagesList = ({
	messages,
	refer,
	lastReadId,
	subs,
	myAddr,
	createReaction,
	stayScrolled,
}) => {
	const messagesList = useMemo(() => {
		const messagesList = [];

		// Start a bundle of messages.
		for (let i = 0; i < messages.length; i++) {
			let includeHeader = true;
			let previousMessage;
			const messagesPack = [];

			// Gather the messages that belong to this bundle.
			while (i < messages.length) {
				const message = messages[i];
				const messageIsNotice = isNotice(message);

				if (message.id === lastReadId) {
					messagesPack.push(<LastRead key={'lastRead'} />);
				}

				const addReaction = msg =>
					createReaction({
						...msg,
						targetID: message.id,
					});

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

				previousMessage = message;

				const isSubscribed = subs.includes(message.addr);
				// Check dynamically, otherwise changing accounts makes them go wrong.
				const isMe = message.addr === myAddr;
				const refersToMe = !isMe && message.content?.includes(formatAddr(myAddr));

				messagesPack.push(
					<Message
						isNotice={messageIsNotice}
						className={classnames('is-relative', {
							'x-me': isMe,
							'x-refers-to-me': refersToMe,
						})}
						includeHeader={includeHeader}
						refer={refer}
						message={message}
						isSubscribed={isSubscribed}
						key={message.id}
						topic={message.topic}
						addReaction={addReaction}
						stayScrolled={stayScrolled}
					>
						<Reactions
							stayScrolled={stayScrolled}
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
				<div key={'pack-' + (previousMessage.id || i)} className="x-message-bundle">
					{messagesPack}
				</div>
			);
		}
		return messagesList;
	}, [messages, lastReadId, subs]);

	return messagesList;
};

export default MessagesList;
