import React from 'react';
import { connect } from 'react-redux';
import { getBalance, logout, login, joinChat } from '../../redux/actions';
import Header from '../components/Header';
import ChatList from '../components/ChatList';
import Chatroom from './Chatroom';
import LoginBox from '../components/LoginBox';
import Footer from '../components/Footer';
import { __ } from '../../misc/util';
import { runtime } from 'webextension-polyfill';

const App = ({ addr, balance, getBalance, topic, logout, login, chatSettings, enterChatroom, messages, subscriptions, connected }) => {
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
						{ __('If it seems stuck for a long, long time, then it probably is.') }
					</p>
					<button type="button" onClick={() => runtime.reload()}>
						{__('Reload')}
					</button>
				</div>
				{ isLoggedIn &&
					<Header
						topic={topic}
						enterChatroom={enterChatroom}
						subscribing={isSubscribing}
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
		</div>
	);
};

const mapStateToProps = state => ({
	addr: state.login ? state.login.addr : {},
	topic: state.topic,
	messages: state.messages,
	subscriptions: state.subscriptions,
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
