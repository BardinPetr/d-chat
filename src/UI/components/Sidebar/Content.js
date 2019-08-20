import React, { useState } from 'react';
import NknBalance from 'Approot/UI/containers/NknBalance';
import TopicLink from 'Approot/UI/components/TopicLink';
import { __, getChatNameForURL } from 'Approot/misc/util';

const Content = ({ chats }) => {
	const [topic, setTopic] = useState('');
	const [creating, setCreating] = useState(false);

	return (
		<div>
			<div className="navbar-start">
				<h2 className="navbar">
					TODO
				</h2>
				<div className="sidebar-heading">
					<h3>{__('Channels')}</h3>
				</div>
				<nav className="chats-list">
					{ chats.map((chat, key) => (
						<div className="chat-list-link" key={key}>
							<TopicLink topic={chat} />
						</div>
					)) }

					{ creating && (
						<form action={`#/${getChatNameForURL(topic)}`}>
							<input type="text" onChange={e => setTopic(e.target.value)} />
						</form>
					)}
				</nav>
				<div className="sidebar-new-topic-button-container">
					<button className="description sidebar-new-channel-button sidebar-button" type="button"
						onClick={() => setCreating(!creating)}>
						{!creating ? __('Add a channel') : __('Nevermind')}
					</button>
					{ creating && (
						<button type="submit" className="sidebar-button">
							{__('Join')}
						</button>
					)}
				</div>

				<p className="description">
					{__('You will need some NKN to subscribe to chats.') + ' '}
				</p>
				<p className="description">
					{__('Your balance')}: <NknBalance />
				</p>
				<TopicLink topic="xxxxx" />
			</div>
		</div>
	);
};

export default Content;
