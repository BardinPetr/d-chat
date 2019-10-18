import React from 'react';
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

class Header extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			topic: '',
			active: false,
			subsOpen: false,
		};

		// Using the items in the hamburger menu should close it.
		this.unlisten = history.listen(() => this.setState({
			active: false
		}));
	}

	componentWillUnmount() {
		this.unlisten();
	}

	handleTopicChange = (e) => {
		this.setState({topic: e.target.value});
	}

	render() {

		const path = matchPath(
			this.props.location.pathname,
			{
				path: ['/chat/:topic', '/whisper/:whisper']
			}
		);
		const topic = path?.params.topic || path?.url;
		const isPrivateChat = topic?.startsWith('/whisper/');

		return (
			<nav className="navbar is-primary has-text-white x-navbar-height">
				<div className="navbar-brand" aria-label="menu navigation" role="navigation">
					<span className="navbar-item">
						<figure className="image is-32x32">
							<DchatLogo white />
						</figure>
						<h5 title={getChatDisplayName(topic)} className="x-truncate x-truncate-limited-20 title is-5 has-text-white x-is-padding-left">{getChatDisplayName(topic) || __('D-Chat')}</h5>
					</span>

					<a
						className={classnames('navbar-burger burger', {
							'is-active': this.state.active,
						})}
						onClick={() => this.setState({ active: !this.state.active })}
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
					className={classnames('navbar-menu', {
						'is-active': this.state.active,
					})}
					role="navigation"
					aria-label="main navigation"
				>
					<div className="navbar-end is-hidden-desktop">
						<SubscriberList
							className={classnames('navbar-item has-dropdown is-hoverable', {
								'is-hidden': topic == null || isPrivateChat,
							})}
							topic={topic}
						/>
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
			</nav>
		);
	}
}

export default Header;
