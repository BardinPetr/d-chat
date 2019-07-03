import React from 'react';
import { connect } from 'react-redux';
import { login, joinChat, publishMessage } from '../../redux/actions';
import Header from '../components/Header';
import ChatList from '../components/ChatList';
import Chatroom from '../components/Chatroom';
import LoginBox from '../components/LoginBox';

const popout = () => {
	browser.windows.create({
		url: browser.runtime.getURL('sidebar.html'),
		type: 'panel',
		height: 600,
		width: 450,
	});
};

const App = ({ addr, topic, login, createMessage, enterChatroom, messages, subscriptions, connected }) => {
	// console.log('Rendering.....................');
	// console.log('all my arguments:', addr, topic, login, createMessage, enterChatroom, messages);
	const isLoggedIn = addr != null;
	const isSubscribing = ( topic && subscriptions[topic] );
	return (
		<div className="app">
			<div className="app-container">
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
