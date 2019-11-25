import React from 'react';
import { connect } from 'react-redux';
import history from 'Approot/UI/history';

import { __ } from 'Approot/misc/browser-util-APP_TARGET';

import { muteChat, removeChat } from 'Approot/redux/actions';

const ChatroomDots = ({ dispatch, topic, chatSettings, }) => (
	<>
		<li><a
			onClick={() =>
				dispatch(muteChat(topic, !chatSettings.muted))
			}
		>
			{chatSettings.muted ? __('Unmute chat') : __('Mute chat')}
		</a></li>
		<li><a
			onClick={() => {
				// First navigate out of chat.
				history.push('/');
				// Then remove it from list.
				dispatch(removeChat(topic));
			}}
		>
			{__('Hide chat')}
		</a></li>
	</>
);

const mapStateToProps = (state, ownProps) => {
	const topic = ownProps.match.params.topic
		// Whisper
		|| ownProps.match.url;
	console.log('topic', topic, ownProps);
	return ({
		chatSettings: state.chatSettings[topic] || {},
		topic: topic,
	});
};

export default connect(mapStateToProps)(ChatroomDots);
