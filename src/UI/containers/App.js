import React from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { getBalance, logout, login, joinChat } from '../../redux/actions';
import Header from '../components/Header';
import ChatList from '../components/ChatList';
import Chatroom from './Chatroom';
import LoginBox from '../components/LoginBox';
import Footer from '../components/Footer';
import { __ } from '../../misc/util';

const App = ({ addr, balance, getBalance, topic, logout, login, chatSettings, enterChatroom, messages, connected }) => {
	return (
		<div className="app">
				{ isLoggedIn &&
					<Header
						topic={topic}
						enterChatroom={enterChatroom}
						connected={connected}
					/> }
				<div className={addr ? ( topic == null ? 'chatlist-container' : 'chatroom'  ) : 'login'}>
					{ isLoggedIn ?
						( topic ?
							<Chatroom />
							:
							<ChatList
								messages={messages}
								enterChatroom={enterChatroom}
								chatSettings={chatSettings}
							/>
						)
						:
						<LoginBox login={login} />
					}
					{ isLoggedIn && !topic &&
						<Footer getBalance={getBalance} balance={balance} logout={logout} />
					}
				</div>
		</div>
	);
};

const mapStateToProps = state => ({
	addr: state.login ? state.login.addr : {},
	topic: state.topic,
	messages: state.messages,
	connected: state.login && state.login.connected,
	chatSettings: state.chatSettings,
	balance: state.nkn?.balance,
});

const mapDispatchToProps = dispatch => ({
	login: credentials => dispatch(login(credentials)),
	logout: () => dispatch(logout()),
	enterChatroom: topic => dispatch(joinChat(topic)),
	getBalance: () => dispatch(getBalance()),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(App);
