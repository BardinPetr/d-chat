import React from 'react';
import { connect } from 'react-redux';
import history from 'Approot/UI/history';

import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { getTopicFromPathname, isWhisperTopic } from 'Approot/misc/util';

import { muteChat, removeChat, unsubscribeChat } from 'Approot/redux/actions';

const ChatroomDots = ({ dispatch, topic, chatSettings, }) => (
	<>
		<li><a
			onClick={() =>
				dispatch(muteChat(topic, !chatSettings.muted))
			}
		>
			{chatSettings.muted ? __('Unmute chat') : __('Mute chat')}
		</a></li>
		{!isWhisperTopic(topic) && (
			<li><a
				onClick={() => {
					history.push('/');
					dispatch(removeChat(topic));
					dispatch(unsubscribeChat(topic));
				}}
			>
				{__('Leave chat')}
			</a></li>
		)}
	</>
);

const mapStateToProps = (state) => {
	const topic = getTopicFromPathname(location.hash);
	return ({
		chatSettings: state.chatSettings[topic] || {},
		topic: topic,
	});
};

export default connect(mapStateToProps)(ChatroomDots);
