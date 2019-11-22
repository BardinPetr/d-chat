import React from 'react';
import { connect } from 'react-redux';
import { matchPath, Link } from 'react-router-dom';
import classnames from 'classnames';
import { getChatDisplayName } from '../../misc/util';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import history from 'Approot/UI/history';

import DchatLogo from 'Approot/UI/components/DchatLogo';
import Popout from 'Approot/UI/components/Popout-APP_TARGET';
import TopicsList from 'Approot/UI/containers/TopicsList';
import SubscriberList from 'Approot/UI/containers/SubscriberList';
import Logout from 'Approot/UI/containers/Logout';
import DotDotDot from 'Approot/UI/components/Chatroom/HeaderDotDotDotBtn';

import { setChatOptions, removeChat } from 'Approot/redux/actions';

class Header extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			topic: '',
			active: false,
			expanded: false,
		};

		// Using the items in the hamburger menu should close it.
		this.unlisten = history.listen(() => this.setState({
			active: false,
			expanded: false,
		}));
	}

	componentWillUnmount() {
		this.unlisten();
	}

	handleTopicChange = (e) => {
		this.setState({topic: e.target.value});
	}

	render() {

		const {
			chatSettings,
			dispatch,
			topic,
			topicName,
			isPrivateChat,
		} = this.props;

		return (
			<React.Fragment>
				<div className="navbar-brand" aria-label="menu navigation" role="navigation">
					<span className="navbar-item">
						<figure className="image is-32x32">
							<DchatLogo white />
						</figure>
						<h5 title={topicName} className="x-truncate x-truncate-limited-width title is-5 has-text-white x-is-padding-left">{topicName || __('D-Chat')}</h5>
					</span>

					<a
						className={classnames('navbar-burger burger', {
							'is-active': this.state.active,
						})}
						onClick={() => this.setState({ active: !this.state.active, expanded: false })}
						aria-label="menu"
						aria-expanded={this.state.active}
						role="button"
					>
						<span aria-hidden="true"></span>
						<span aria-hidden="true"></span>
						<span aria-hidden="true"></span>
					</a>

				</div>
				<div
					className={classnames('navbar-menu x-navbar-buttons', {
						'is-active': this.state.expanded || this.state.active,
					})}
					role="navigation"
					aria-label="main navigation"
				>
					<div className="navbar-end">
						<SubscriberList
							className={classnames('navbar-item has-dropdown is-hoverable', {
								'is-hidden': topic == null || isPrivateChat,
								'is-active': this.state.expanded,
							})}
							active={this.state.expanded}
							topic={topic}
							onClick={() => this.setState({expanded: !this.state.expanded})}
						/>
						{topic && (
							<DotDotDot>
								<li><a
									onClick={() => 
										dispatch(setChatOptions(topic, {
											muted: !chatSettings.muted,
										}))
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
									{__('Close chat')}
								</a></li>
							</DotDotDot>
						)}
					</div>

					<div className="navbar-start is-hidden-desktop is-hidden-tablet">
						<Link className="navbar-item" to="/">{__('Home')}</Link>
						<Link className="navbar-item" to="/topics">{__('Public')}</Link>

						<div className="navbar-item">
							<p className="menu-label">{__('Channels')}</p>
							<TopicsList />
						</div>

						<div className="navbar-item">
							<p className="menu-label">{__('Whispers')}</p>
							<TopicsList whispers />
						</div>

						<div className="navbar-item is-hidden-desktop">
							<p className="menu-label">
								{__('Account')}
							</p>
							<ul className="menu-list">
								<li>
									<Link to="/wallets">
										{__('Accounts')}
									</Link>
								</li>
								<li>
									<Logout>
										{__('Log Out')}
									</Logout>
								</li>
							</ul>
						</div>

						<div className="navbar-item">
							<Popout />
						</div>

					</div>

				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = state => {
	const path = matchPath(
		history.location.pathname,
		{
			path: ['/chat/:topic', '/whisper/:whisper']
		}
	);
	const topic = path?.params.topic || path?.url;
	const topicName = getChatDisplayName(topic);
	const isPrivateChat = topic?.startsWith('/whisper/');

	return ({
		chatSettings: state.chatSettings[topic],
		topic,
		topicName,
		isPrivateChat,
	});
};

export default connect(mapStateToProps)(Header);
