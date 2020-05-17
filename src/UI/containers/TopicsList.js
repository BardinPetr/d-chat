/**
 * Lists joined topics and whispers.
 */
import React from 'react';
import { connect } from 'react-redux';
import { removeChat } from 'Approot/redux/actions';
import classnames from 'classnames';
import TopicLink from 'Approot/UI/components/TopicLink';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import {
	getChatDisplayName,
	DCHAT_PUBLIC_TOPICS,
	isWhisperTopic,
} from 'Approot/misc/util';

const Element = ({ hide, chat }) => (
	!chat.hidden && (
		<li title={getChatDisplayName(chat.topic)}>
			<span className="delete is-medium" onClick={e => {
				e.preventDefault();
				hide(chat.topic);
			}} />
			<TopicLink
				topic={chat.topic}
				className={classnames('x-topic-link is-clearfix x-truncate', {
					'has-text-grey': chat.muted,
				})}
				activeClassName="is-active"
				avatarClassName="is-24x24"
			>
				<span className={classnames('x-unread-count', {
					'x-is-delayed': !!chat.unread?.length,
				})}>
					{chat.unread?.length > 0 ? chat.unread.length : ''}
				</span>
			</TopicLink>
		</li>
	)
);

const TopicsList = ({ hide, topics, whispers, labelClassName = '', wrapperClassName = '' }) => (
	<React.Fragment key="topics-list">
		<div className={`x-topics-list x-topics-list-public ${wrapperClassName}`}>
			<p className={labelClassName}>{__('Channels')}</p>
			<ul className="menu-list">
				{topics.map(chat => (
					<Element key={chat.topic} chat={chat} hide={hide} />
				))}
			</ul>
		</div>
		<div className={`x-topics-list x-topics-list-private ${wrapperClassName}`}>
			<p className={labelClassName}>{__('Whispers')}</p>
			<ul className="menu-list">
				{whispers.map(chat => (
					<Element key={chat.topic} chat={chat} hide={hide} />
				))}
			</ul>
		</div>
	</React.Fragment>
);

// Sorts newest messages on top.
const sorter = (a, b) => {
	const lastMessageA = a.lastMessage || 1;
	const lastMessageB = b.lastMessage || 1;

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
			} else if (key !== DCHAT_PUBLIC_TOPICS) {
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

const mapDispatchToProps = dispatch => ({
	hide: topic => dispatch(removeChat(topic)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TopicsList);
