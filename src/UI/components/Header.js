import React from 'react';
import { matchPath, Link } from 'react-router-dom';
import classnames from 'classnames';
import { __, getChatDisplayName } from '../../misc/util';
import history from 'Approot/UI/history';

import DchatLogo from 'Approot/UI/components/DchatLogo';
import NewTopicForm from 'Approot/UI/components/NewTopicForm';
import Popout from 'Approot/UI/components/Popout';
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

		const topic = matchPath(
			this.props.location.pathname,
			{
				path: '/chat/:topic'
			}
		)?.params.topic;

		return (
			<nav className="navbar is-primary has-text-white">
				<div className="navbar-brand" aria-label="menu navigation" role="navigation">
					<Link to="/" className="navbar-item">
						<figure className="image is-32x32">
							<DchatLogo white />
						</figure>
						<h5 className="title is-5 has-text-white x-is-padding-left">{getChatDisplayName(topic) || __('D-Chat')}</h5>
					</Link>

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
					<div className="navbar-end">
						<SubscriberList
							className={classnames('navbar-item has-dropdown is-hoverable', {
								'is-hidden': topic == null,
							})}
							topic={topic}
						/>
					</div>
					<div className="navbar-start is-hidden-tablet">

						<Link className="navbar-item" to="/">{__('Home')}</Link>

						<div className="navbar-item">
							<p className="menu-label">{__('Channels')}</p>
							<TopicsList />
						</div>

						<div className="navbar-item">
							<label className="menu-label">
								{__('Add a channel')}
							</label>
							<NewTopicForm />
						</div>

						<div className="navbar-item">
							<p className="menu-label">{__('New view')}</p>
							<Popout />
						</div>

						<div className="navbar-item is-hidden-desktop">
							<label className="menu-label">
								{__('Account')}
							</label>
							<ul className="menu-list">
								<li>
									<Logout>
										{__('Log Out')}
									</Logout>
								</li>
							</ul>
						</div>


					</div>

				</div>
			</nav>
		);
	}
}

export default Header;
