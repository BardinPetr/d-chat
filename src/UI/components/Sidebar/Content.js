import React, { useState } from 'react';
import NknBalance from 'Approot/UI/containers/NknBalance';
import TopicLink from 'Approot/UI/components/TopicLink';
import { __, getChatNameForURL } from 'Approot/misc/util';

const Content = ({ chats }) => {
	const [topic, setTopic] = useState('');

	return (
		<div className="sidebar-content">
			<div className="chats-list">
				{ chats.map((chat, key) => (
					<div className="chat-list-link" key={key}>
						<TopicLink topic={chat} />
					</div>
				)) }
			</div>
			<form action={`#/chat/${getChatNameForURL(topic)}`} className="input narrow input-channel-form">
				<input type="text" onChange={(e) => setTopic(e.target.value)} />
				<button type="submit" className="submit">{ __('Join') }</button>
			</form>
			<p className="description">
				{__('You will need some NKN to subscribe to chats.') + ' '}
			</p>
			<p className="description">
				{__('Your balance')}: <NknBalance />
			</p>
			<TopicLink topic="xxxxx" />
		</div>
	);
};

export default Content;
