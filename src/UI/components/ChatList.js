import React from 'react';

import { getChatDisplayName, __ } from '../../misc/util';

const Info = () => (
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
	</div>
);

const Chat = ({ messages, topic, onClick }) => {
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
			<div className='chat-preview'>
				{previewText}
			</div>
		</li>
	);
};

export default class ChatList extends React.Component {
	render() {
		const { messages = {}, enterChatroom } = this.props;

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
			return new Date(b.messages[0].timestamp).getTime() - new Date(a.messages[0].timestamp).getTime();
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
