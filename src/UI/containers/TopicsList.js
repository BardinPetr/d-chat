/**
 * Lists joined topics and whispers.
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import TopicLink from 'Approot/UI/components/TopicLink';
import {
	getChatURL,
	getChatDisplayName,
	DCHAT_PUBLIC_TOPICS,
} from 'Approot/misc/util';
import history from 'Approot/UI/history';

const TopicsList = ({ chats, whispers }) => (
	<ul className="menu-list">
		{chats.map((chat, key) =>
			chat.topic !== DCHAT_PUBLIC_TOPICS &&
			// List topics or whispers.
			((chat.topic.startsWith('/whisper/') && whispers) ||
				(!chat.topic.startsWith('/whisper/') && !whispers)) ? (
					<li key={key} title={getChatDisplayName(chat.topic)}>
						<TopicLink
							topic={chat.topic}
							className={classnames('x-topic-link is-clearfix x-truncate', {
								'is-active': chat.active,
								'has-text-black': chat.unread?.length > 0,
							})}
						>
							<span>{getChatDisplayName(chat.topic)}</span>
							<span className="is-pulled-right">
								{chat.unread?.length > 0 ? chat.unread.length : ''}
							</span>
						</TopicLink>
					</li>
				) : (
					undefined
				),
		)}
	</ul>
);

const mapStateToProps = state => {
	let newState = [];
	for (const key in state.chatSettings) {
		newState.push({
			topic: key,
			unread: state.chatSettings[key].unread,
			active: history.location.pathname === getChatURL(key),
		});
	}
	// Sort newest messages on top.
	newState.sort((a, b) => {
		let lastMessageA = state.messages[a.topic];
		let lastMessageB = state.messages[b.topic];
		lastMessageA = lastMessageA?.[lastMessageA.length - 1]?.timestamp;
		lastMessageB = lastMessageB?.[lastMessageB.length - 1]?.timestamp;

		if (!lastMessageA) {
			return 1;
		} else if (!lastMessageB) {
			return -1;
		}

		const latest =
			new Date(lastMessageA) - new Date(lastMessageB) > 0
				? -1
				: 1;
		if (a.unread?.length > 0) {
			if (b.unread?.length > 0) {
				return latest;
			} else {
				return -1;
			}
		} else if (b.unread?.length > 0) {
			return 1;
		}
		return latest;
	});

	return {
		chats: newState,
	};
};

export default connect(mapStateToProps)(TopicsList);
