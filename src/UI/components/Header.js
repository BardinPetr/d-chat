import React from 'react';
import { matchPath, Link } from 'react-router-dom';
import classnames from 'classnames';
import { __, getChatDisplayName } from '../../misc/util';
import DchatLogo from 'Approot/UI/components/DchatLogo';
import { NewTopicForm } from 'Approot/UI/containers/Sidebar';
import Popout from 'Approot/UI/components/Popout';
import history from 'Approot/UI/history';
import TopicsList from 'Approot/UI/containers/TopicsList';

class Header extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			topic: '',
			active: false,
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
			<nav className="navbar is-primary">
				<div className="container has-text-white">
					<div className="navbar-brand">
						<div className="navbar-item">
							<figure className="image is-32x32">
								<DchatLogo white />
							</figure>
						</div>
						<div className="navbar-item">
							<h5 className="title is-5 has-text-white">{getChatDisplayName(topic) || __('D-Chat')}</h5>
						</div>
						<a className={classnames('navbar-burger burger', {
							'is-active': this.state.active,
						})} onClick={() => this.setState({ active: !this.state.active })}>
							<span aria-hidden="true"></span>
							<span aria-hidden="true"></span>
							<span aria-hidden="true"></span>
						</a>
					</div>
					<div className={classnames('navbar-menu is-hidden-tablet', {
						'is-active': this.state.active,
					})}>
						<div className="navbar-start">
							<Link className="navbar-item" to="/">{__('Home')}</Link>
							<div className="navbar-item">
								<p className="menu-label">{__('Channels')}</p>
								<TopicsList />
							</div>
						</div>
						<div className="navbar-end">
							<div className="navbar-item">
								<label className="label menu-label">
									{__('Add a channel')}
								</label>
								<NewTopicForm />
							</div>
							<div className="navbar-item">
								<p className="menu-label">{__('New view')}</p>
								<Popout />
							</div>
						</div>
					</div>
				</div>
			</nav>
		);
	}
}

export default Header;
