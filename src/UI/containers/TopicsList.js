/**
 * Lists joined topics and whispers.
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import TopicLink from 'Approot/UI/components/TopicLink';
import {
	getChatDisplayName,
	DCHAT_PUBLIC_TOPICS,
	isWhisperTopic,
} from 'Approot/misc/util';

const Element = ({ chat }) => (
	!chat.hidden && (
		<li title={getChatDisplayName(chat.topic)}>
			<TopicLink
				topic={chat.topic}
				className={classnames('x-topic-link is-clearfix x-truncate', {
					'has-text-grey': chat.muted,
				})}
				activeClassName="is-active"
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
	const lastMessageA = a || 1;
	const lastMessageB = b || 1;

	if (!lastMessageA) {
		return 1;
	} else if (!lastMessageB) {
		return -1;
	}

	// Sort muted channels last.
	if (a.muted && !b.muted) {
		return 1;
	} else if (!a.muted && b.muted) {
		return -1;
	}

	const latest =
		lastMessageA - lastMessageB > 0
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
				lastMessage: settings.receivedAt,
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
