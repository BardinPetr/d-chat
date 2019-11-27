/**
 * Lists messages and reactions that belong to a topic.
 */
import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { ResizeReporter } from 'react-resize-reporter/scroll';
import Message from './Message';
import Reactions from './Reactions';
import InfiniteScroller from 'react-infinite-scroller';
import useStayScrolled from 'react-stay-scrolled';
import classnames from 'classnames';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { debounce } from 'debounce';
import { isNotice } from 'Approot/misc/util';
import 'highlight.js/styles/github.css';

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

const Messages = ({
	messages,
	hasMore,
	loadMore,
	refer,
	lastReadId,
	subs,
	reactions,
	markAllMessagesRead,
	createReaction,
	myAddr,
	totalMessagesCount,
}) => {
	const listRef = useRef();
	const { stayScrolled, isScrolled } = useStayScrolled(listRef, {
		initialScroll: Infinity,
		inaccuracy: 15,
	});

	useLayoutEffect(() => {
		stayScrolled();

		if (isScrolled()) {
			markAllMessagesRead();
		}
		// XXX Passing entire `reactions` object here. Good/bad idea?
		// Could pass messages[0] as well, instead of totalMessagesCount & topic.
	}, [totalMessagesCount, messages[0]?.topic, reactions]);

	let previousMessage;
	const messageList = messages.reduce((acc, message) => {
		let includeHeader = true;
		const messageIsNotice = isNotice(message);
		if (message.id === lastReadId) {
			acc.push(<LastRead key={'lastRead'} />);
		}

		const messageReactions = reactions[message.id];
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
				{messageReactions && (
					<Reactions
						addReaction={addReaction}
						myAddr={myAddr}
						reactions={messageReactions}
					/>
				)}
			</Message>,
		);
	}, []);

	const stay = debounce(stayScrolled, 50, true);

	return (
		<div
			className={`x-is-fullwidth is-scrollable is-relative x-chatroom-messages`}
			ref={listRef}
		>
			<ResizeReporter onSizeChanged={() => stay()} />
			<InfiniteScroller
				pageStart={0}
				isReverse
				loadMore={loadMore}
				hasMore={hasMore}
				loader={<div className="is-loader" key={0} />}
				initialLoad={false}
				useWindow={false}
				threshold={200}
				className="x-is-fullwidth"
			>
				<div className="x-chat">{messageList}</div>
			</InfiniteScroller>
		</div>
	);
};

export default Messages;
