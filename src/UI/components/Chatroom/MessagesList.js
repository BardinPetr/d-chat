import React, { useRef, useEffect } from 'react';
import classnames from 'classnames';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import Reactions from 'Approot/UI/containers/Chatroom/Reactions';
import Message from './Message';
import { isNotice } from 'Approot/misc/util';

// 1min 30seconds seconds.
const SEPARATE_MESSAGE_TIME = (60 + 30) * 1000;

const LastRead = () => {
	const lastReadRef = useRef();
	useEffect(() => {
		lastReadRef.current.scrollIntoView();
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
	let previousMessage;
	const messageList = messages.reduce((acc, message) => {
		let includeHeader = true;
		const messageIsNotice = isNotice(message);
		if (message.id === lastReadId) {
			acc.push(<LastRead key={'lastRead'} />);
		}

		// TODO fix the toolbar reaction button.
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
			}
		}

		previousMessage = message;

		return acc.concat(
			<Message
				isNotice={messageIsNotice}
				className={classnames('is-relative', {
					'x-me': message.isMe,
					'x-refers-to-me': message.refersToMe,
				})}
				includeHeader={includeHeader}
				refer={refer}
				message={message}
				isSubscribed={subs.includes(message.addr)}
				key={message.id}
				isNotice={'dchat/subscribe' === message.contentType}
				topic={message.topic}
				addReaction={addReaction}
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
	}, []);

	return messageList;
};

export default MessagesList;
