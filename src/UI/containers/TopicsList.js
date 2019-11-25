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
	isWhisperTopic,
} from 'Approot/misc/util';
import history from 'Approot/UI/history';

const Element = ({ chat }) => (
	!chat.hidden && (
		<li title={getChatDisplayName(chat.topic)}>
			<TopicLink
				topic={chat.topic}
				className={classnames('x-topic-link is-clearfix x-truncate', {
					'is-active': chat.active,
					'has-text-black': chat.unread?.length > 0,
					'has-text-grey': chat.muted,
				})}
			>
				<span>{getChatDisplayName(chat.topic)}</span>
				<span className="is-pulled-right">
					{chat.unread?.length > 0 ? chat.unread.length : ''}
				</span>
			</TopicLink>
		</li>
	)
);

const TopicsList = ({ topics, whispers, showWhispers }) => (
	<ul className="menu-list">
		{showWhispers
			? whispers.map((chat, key) => (
				<Element key={key} chat={chat} />
			))
			: topics.map((chat, key) => (
				<Element key={key} chat={chat} />
			))}
	</ul>
);

// Sorts newest messages on top.
const sorter = (a, b) => {
	const lastMessageA = a.lastMessage;
	const lastMessageB = b.lastMessage;

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
};

const mapStateToProps = state => {
	const topics = [];
	const whispers = [];

	// Separate whispers and topics.
	for (const key in state.chatSettings) {
		if (!state.chatSettings[key].hidden) {
			const settings = state.chatSettings[key];
			const element = {
				topic: key,
				unread: settings.unread,
				active: history.location.pathname === getChatURL(key),
				lastMessage: state.messages[key]?.[state.messages[key].length - 1]?.timestamp,
				muted: settings.muted,
			};

			if (isWhisperTopic(key)) {
				whispers.push(element);
				// Ignore __dchat topic.
			} else if (key !== DCHAT_PUBLIC_TOPICS){
				topics.push(element);
			}
		}
	}

	// Sort newest messages on top.
	topics.sort(sorter);
	whispers.sort(sorter);

	return {
		topics,
		whispers,
	};
};

export default connect(mapStateToProps)(TopicsList);
