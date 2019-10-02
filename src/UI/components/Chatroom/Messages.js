import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import Message from './Message';
import InfiniteScroller from 'react-infinite-scroller';
import useStayScrolled from 'react-stay-scrolled';
import classnames from 'classnames';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const LastRead = () => {
	const lastReadRef = useRef();
	useEffect(() => {
		lastReadRef.current.scrollIntoView();
	}, []);
	// The extra div makes the divider be fully in view when it is scrolledIntoView.
	return (<React.Fragment>
		<div
			style={{marginTop: '1rem'}}
			ref={lastReadRef}
		/>
		<div
			className="is-divider"
			data-content={__('New messages below')}
		/>
	</React.Fragment>);
};

const Messages = ({ messages, className, hasMore, loadMore, refer, lastReadId, subs, markAllMessagesRead }) => {
	const [lastRead, setLastRead] = useState(null);
	const listRef = useRef();
	const { stayScrolled, isScrolled } = useStayScrolled(listRef, {
		initialScroll: Infinity,
		inaccuracy: 15,
	});

	if ( lastReadId && lastReadId !== lastRead ) {
		setLastRead(lastReadId);
	}

	useLayoutEffect(() => {
		stayScrolled();
		if (isScrolled()) {
			markAllMessagesRead();
		}
	}, [messages.length, messages[0]?.topic]);

	// Flag to make sure we insert "NEW MESSAGES BELOW" only once.
	let didNotMarkYet = true;
	const messageList = messages.reduce((acc, message, idx) => {
		if (didNotMarkYet && message.id === lastRead) {
			acc.push(
				<LastRead
					key={'lastRead'}
				/>
			);
			didNotMarkYet = false;
		}

		return acc.concat(
			<Message
				className={classnames('', {
					'x-me': message.isMe,
					'x-refers-to-me': message.refersToMe,
				})}
				refer={refer}
				message={message}
				isSubscribed={subs.includes(message.addr)}
				key={message.id + idx}
				isNotice={['dchat/subscribe'].includes(message.contentType)}
				topic={message.topic}
			/>,
		);
	}, []);


	return (
		<div
			className={className}
			ref={listRef}
		>
			<InfiniteScroller
				pageStart={0}
				isReverse
				loadMore={loadMore}
				hasMore={hasMore}
				loader={<div className="is-loader" key={0} />}
				initialLoad={false}
				useWindow={false}
				threshold={100}
				className="x-is-fullwidth"
			>
				<div className="container">
					<div className="x-chat">{messageList}</div>
				</div>
			</InfiniteScroller>
		</div>
	);
};

export default Messages;
