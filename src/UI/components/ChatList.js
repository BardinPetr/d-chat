import React from 'react';
import classnames from 'classnames';

import { getChatDisplayName, __ } from '../../misc/util';

const Info = ({ enterChatroom }) => (
	<div className="text-container description">
		<p>
			{ __('To join or create a channel, use the button top-right. You will then be subscribed to the channel.') }
		</p>
		<p>
			{ __('Subscribing to a channel can take a while, but usually less than 60 seconds. It depends on which block you get into.') }
		</p>
		<p>
			<i>{ __('You can send messages before subscriptions complete, but you will not receive them until your subscription resolves.') }</i>
		</p>
		<p>
			{__('Join channel')}
			{' '}<a onClick={() => enterChatroom('d-chat')} href="#d-chat">#d-chat</a>!!!{' '}
			{__('And give feedback, thanks!')}
		</p>
	</div>
);

const Chat = ({ messages, topic, onClick, unreadCount }) => {
	let lastMessage, lastActiveTimeText, previewText;
	if (messages && messages.length) {
		lastMessage = messages[messages.length-1];

		let lastActiveTime = new Date(lastMessage.timestamp);
		if (lastActiveTime.toDateString() === new Date().toDateString()) {
			lastActiveTimeText = lastActiveTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
		} else {
			lastActiveTimeText = lastActiveTime.toLocaleDateString();
		}

		previewText = lastMessage.content;
		previewText = lastMessage.username + ': ' + previewText;
	}

	return (
		<li className='chat' onClick={onClick}>
			<div className='chat-info'>
				<div className='chat-name'>
					{getChatDisplayName(topic)}
				</div>
				<div className='chat-info-fill' />
				<div className='chat-time'>
					{lastActiveTimeText}
				</div>
			</div>
			<div className='chat-info'>
				<div className='chat-preview'>
					{previewText}
				</div>
				<div className={classnames('chat-unread', {
					description: unreadCount === 0,
				})}>
					{unreadCount}
				</div>
			</div>
		</li>
	);
};

export default class ChatList extends React.Component {
	render() {
		const { messages = {}, enterChatroom, chatSettings } = this.props;

		let chatList = [];
		for (let topic of Object.keys(messages) ) {
			chatList.push({
				topic: topic,
				messages: messages[topic],
			});
		}

		chatList.sort(function(a, b) {
			if (!a.messages || a.messages.length === 0) {
				return 1;
			}
			if (!b.messages || b.messages.length === 0) {
				return -1;
			}
			return new Date(b.messages[b.messages.length - 1].timestamp).getTime() - new Date(a.messages[a.messages.length - 1].timestamp).getTime();
		});

		return (
			<div className="chatlist-container">
				<ul className="chatlist">
					{ chatList.length
						?
						chatList.map(item => (
							<Chat
								key={item.topic}
								messages={item.messages}
								topic={item.topic}
								onClick={() => enterChatroom(item.topic)}
								unreadCount={chatSettings[item.topic] ? chatSettings[item.topic].unread.length : 0}
							/>
						))
						:
						<Info enterChatroom={enterChatroom} />
					}
				</ul>
			</div>
		);
	}
}
