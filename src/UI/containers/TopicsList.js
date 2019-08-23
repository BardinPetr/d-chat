import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import TopicLink from 'Approot/UI/components/TopicLink';
import { getChatDisplayName } from 'Approot/misc/util';

const TopicsList = ({ chats }) => (
	<ul className="menu-list">
		{chats.map((chat, key) => (
			<li key={key}>
				<TopicLink topic={chat.topic} className={classnames('is-clearfix', {
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
