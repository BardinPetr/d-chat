/**
 * Lists messages and reactions that belong to a topic.
 */
import React from 'react';
import MessagesList from 'Approot/UI/components/Chatroom/MessagesList';
import MessagesScroller from 'Approot/UI/components/Chatroom/MessagesScroller';
import 'highlight.js/styles/github.css';

const Messages = ({
	createReaction,
	hasMore,
	lastReadId,
	loadMore,
	markAllMessagesRead,
	messages = [],
	myAddr,
	refer,
	subs,
	topic,
}) => (
	<MessagesScroller
		listClassname="x-is-fullwidth is-scrollable is-relative x-chatroom-messages"
		scrollTriggers={[topic, messages.length]}
		markAllMessagesRead={markAllMessagesRead}
		topic={topic}
		loadMore={loadMore}
		hasMore={hasMore}
	>
		{stayScrolled => (
			<div className="x-chat">
				<MessagesList
					stayScrolled={stayScrolled}
					messages={messages}
					refer={refer}
					lastReadId={lastReadId}
					subs={subs}
					myAddr={myAddr}
					createReaction={createReaction}
				/>
			</div>
		)}
	</MessagesScroller>
);

export default Messages;
