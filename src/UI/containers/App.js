import React from 'react';
import { connect } from 'react-redux';
import { login, joinChat, publishMessage } from '../../redux/aliases';
import Header from '../components/Header';
import ChatList from '../components/ChatList';
import Chatroom from '../components/Chatroom';
import LoginBox from '../components/LoginBox';

const popout = () => {
	browser.windows.create({
		url: browser.runtime.getURL('popup.html'),
		type: 'panel',
		height: 600,
		width: 450,
	});
};

const App = ({ addr, topic, login, createMessage, enterChatroom, chats, subscriptions }) => {
	console.log('Rendering.....................');
	console.log('all my arguments:', addr, topic, login, createMessage, enterChatroom, chats, subscriptions);
	const isLoggedIn = addr != null;
	const chat = topic ? chats[topic] : null;
	const subscribing = subscriptions.find(i => i.topic === topic) != null;
	return (
		<div className="app">
			<div className="app-container">
				{ isLoggedIn &&
					<Header
						topic={topic}
						enterChatroom={enterChatroom}
						subscribing={subscribing}
						popout={popout}
					/> }
				{ isLoggedIn ?
					( topic ?
						<Chatroom
							chat={chat}
							createMessage={createMessage}
						/>
						:
						<ChatList
							chats={chats}
							enterChatroom={enterChatroom}
						/>
					)
					:
					<LoginBox login={login} username={addr} />
				}
			</div>
		</div>
	);
};

const mapStateToProps = state => ({
	addr: state.addr,
	topic: state.topic,
	chats: state.chats,
	subscriptions: state.subscriptions
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
