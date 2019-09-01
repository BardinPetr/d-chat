import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import TopicLink from 'Approot/UI/components/TopicLink';
import { getChatURL, getChatDisplayName, __ } from 'Approot/misc/util';
import { removeChat } from 'Approot/redux/actions';
import history from 'Approot/UI/history';

const TopicsList = ({ chats, whispers, dispatch }) => (
	<ul className="menu-list">
		{chats.map((chat, key) => (
			((chat.topic.startsWith('/whisper/') && whispers) || (!chat.topic.startsWith('/whisper/') && !whispers)) ? (
				<li key={key} title={getChatDisplayName(chat.topic)}>
					<TopicLink topic={chat.topic} className={classnames('x-topic-link is-clearfix x-truncate', {
						'is-active': chat.active,
						'has-text-black': (chat.unread.length > 0),
					})}>
						<span
							title={__('Remove')}
							className="delete is-small is-inline-block-mobile x-is-hover-hidden" onClick={(e) => {
								e.preventDefault();
								// Navigate away from closing chat first.
								if (history.location.pathname.indexOf(chat.topic) > -1) {
									history.push('/');
								}
								dispatch(removeChat(chat.topic));
							}}
						/>
						{' '}
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
			active: history.location.pathname === getChatURL(key),
		});
	}
	return ({
		chats: newState,
	});
};

export default connect(mapStateToProps)(TopicsList);
