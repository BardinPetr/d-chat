import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import TopicLink from 'Approot/UI/components/TopicLink';
import { getChatDisplayName } from 'Approot/misc/util';

const TopicsList = ({ chats, whispers }) => (
	<ul className="menu-list">
		{chats.map((chat, key) => (
			((chat.topic.startsWith('/whisper/') && whispers) || (!chat.topic.startsWith('/whisper/') && !whispers)) ? (
				<li key={key} title={getChatDisplayName(chat.topic)}>
					<TopicLink topic={chat.topic} className={classnames('is-clearfix x-truncate', {
						'has-text-black': chat.unread.length > 0,
					})}>
						<span>
							{getChatDisplayName(chat.topic)}
						</span>
						<span className="is-pulled-right">
							{chat.unread.length > 0 ? chat.unread.length : ''}
						</span>
					</TopicLink>
				</li>
			) : undefined
		))}
	</ul>
);

const mapStateToProps = state => {
	let newState = [];
	for (const key in state.chatSettings) {
		newState.push({
			topic: key,
			unread: state.chatSettings[key].unread,
		});
	}
	return ({
		chats: newState,
	});
};

export default connect(mapStateToProps)(TopicsList);
