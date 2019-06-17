import React from 'react';

import { getChatName, __ } from './util';

const Info = () => (
	<div className="text-container description">
		<p>
			{ __('To join a channel, use the button top-right. You will then be subscribed to the channel.') }
		</p>
		<p>
			{ __('Subscribing to a channel can take a while, but usually less than 60 seconds. It depends on which block you get into.') }
		</p>
		<p>
			<i>{ __('You can send messages before subsriptions complete, but you will not receive them until your subscription resolves.') }</i>
		</p>
	</div>
);

const Chat = ({ chat, onClick }) => {
	let lastMessage, lastActiveTimeText, previewText;
	if (chat.messages && chat.messages.length) {
		lastMessage = chat.messages[chat.messages.length-1];

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
					{getChatName(chat.topic)}
				</div>
				<div className='chat-info-fill' />
				<div className='chat-time'>
					{lastActiveTimeText}
				</div>
			</div>
			<div className='chat-preview'>
				{previewText}
			</div>
		</li>
	);
};

export default class ChatList extends React.Component {
	render() {
		const { chats, enterChatroom } = this.props;

		let chatList = [];
		for (let topic in chats) {
			if (chats.hasOwnProperty(topic) && chats[topic]) {
				chatList.push({
					topic: topic,
					chat: chats[topic],
				});
			}
		}

		chatList.sort(function(a, b) {
			if (!a.chat.messages || a.chat.messages.length === 0) {
				return 1;
			}
			if (!b.chat.messages || b.chat.messages.length === 0) {
				return -1;
			}
			return b.chat.messages[b.chat.messages.length-1].timestamp - a.chat.messages[a.chat.messages.length-1].timestamp;
		});

		return (
			<div className="chatlist-container">
				<ul className="chatlist">
					{ chatList.length
						?
						chatList.map(item => (
							<Chat
								key={item.topic}
								chat={item.chat}
								onClick={() => enterChatroom(item.chat.topic)}
							/>
						))
						:
						<Info />
					}
				</ul>
			</div>
		);
	}
}
