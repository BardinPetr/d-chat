import React from 'react';
import { connect } from 'react-redux';
import { login, joinChat, publishMessage } from '../../redux/actions';
import Header from '../components/Header';
import ChatList from '../components/ChatList';
import Chatroom from '../components/Chatroom';
import LoginBox from '../components/LoginBox';
import { __ } from '../../misc/util';

const popout = () => {
	browser.windows.create({
		url: browser.runtime.getURL('sidebar.html'),
		type: 'panel',
		height: 700,
		width: 550,
	});
};

const App = ({ addr, topic, login, createMessage, enterChatroom, messages, subscriptions, connected }) => {
	// console.log('Rendering.....................');
	// console.log('all my arguments:', addr, topic, login, createMessage, enterChatroom, messages);
	const isLoggedIn = addr != null;
	const isSubscribing = ( topic && subscriptions[topic] );
	const loading = ( isLoggedIn && !connected );
	return (
		<div className="app">
			<div className={`app-container ${loading ? 'loading' : ''}`}>
				<div className={loading ? 'absolute loading-description' : 'hidden'}>
					<i className="loader" />
					<p>
						{ __('Connecting...') }
					</p>
					<p className="description">
						{ __('If it seems stuck, restart your browser.') }
					</p>
				</div>
				<div className={addr ? ( topic == null ? 'chatlist-container' : 'chatroom'  ) : 'login'}>
					{ isLoggedIn &&
						<Header
							topic={topic}
							enterChatroom={enterChatroom}
							subscribing={isSubscribing}
							popout={popout}
							connected={connected}
						/> }
					{ isLoggedIn ?
						( topic ?
							<Chatroom
								messages={messages[topic]}
								createMessage={message => createMessage({...message, topic})}
							/>
							:
							<ChatList
								messages={messages}
								enterChatroom={enterChatroom}
							/>
						)
						:
						<LoginBox login={login} />
					}
				</div>
			</div>
		</div>
	);
};

const mapStateToProps = state => ({
	addr: state.login ? state.login.addr : {},
	topic: state.topic,
	messages: state.messages,
	subscriptions: state.subscriptions,
	connected: state.login && state.login.connected
});

const mapDispatchToProps = dispatch => ({
	login: credentials => dispatch(login(credentials)),
	createMessage: message => dispatch(publishMessage(message)),
	enterChatroom: topic => dispatch(joinChat(topic))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(App);
