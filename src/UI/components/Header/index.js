import React from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { getChatDisplayName, getTopicFromPathname } from 'Approot/misc/util';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import history from 'Approot/UI/history';

import HorizontalScroll from 'Approot/UI/components/HorizontalScroll';
import DchatLogo from 'Approot/UI/components/DchatLogo';
import ActiveChatsList from 'Approot/UI/containers/Header/ActiveTopics';
import Popout from 'Approot/UI/components/Popout-APP_TARGET';
import TopicsList from 'Approot/UI/containers/TopicsList';
import SubscriberList from 'Approot/UI/containers/SubscriberList';
import DotDotDot from 'Approot/UI/components/Header/DotDotDot';
import DotDotDotRoutes from 'Approot/UI/components/Header/DotDotDotRoutes';

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
		this.handleTopicChange = this.handleTopicChange.bind(this);
	}

	componentWillUnmount() {
		this.unlisten();
	}

	handleTopicChange (e) {
		this.setState({ topic: e.target.value });
	}

	render() {
		// We are using 'location.hash', instead of 'history.location.pathname',
		// because the latter does not work with topics like '#d-chat' (with hash).
		const topic = getTopicFromPathname(location.hash);
		const topicName = getChatDisplayName(topic);
		const notChat = !topic;

		return (
			<React.Fragment key="header-frag">
				<div className="navbar-brand x-navbar-brand is-inline-flex x-navbar-brand" aria-label={__('menu navigation')} role="navigation">
					{notChat ? (
						<span className="navbar-item">
							<figure className="image is-32x32">
								<DchatLogo blue />
							</figure>
							<h5 title={topicName} className="x-truncate x-truncate-limited-width title is-5 x-is-padding-left">{topicName || __('D-Chat')}</h5>
						</span>
					) : (
						<div className="x-active-tabs-container navbar-tabs">
							<HorizontalScroll className="tabs is-toggle">
								<ActiveChatsList />
							</HorizontalScroll>
						</div>
					)}

					<a
						className={classnames('navbar-burger', {
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

				<DotDotDot
					className="navbar-item x-header-dots is-inline-flex"
					aria-label={__('secondary navigation')}
					role="navigation"
					title={__('Chat settings')}
				>
					<DotDotDotRoutes />
				</DotDotDot>

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
								'is-hidden': topic == null,
								'is-active': this.state.expanded,
							})}
							active={this.state.expanded}
							topic={topic}
							onClick={() => this.setState({ expanded: !this.state.expanded })}
						/>

					</div>

					<div className="navbar-start is-hidden-desktop is-hidden-tablet">
						<Link className="navbar-item" to="/">{__('Home')}</Link>
						<Link className="navbar-item" to="/topics">{__('Public')}</Link>
						<Link className="navbar-item" to="/options">{__('Options')}</Link>

						<TopicsList labelClassName="menu-label" wrapperClassName="navbar-item" />

						<div className="navbar-item">
							<Popout />
						</div>

					</div>

				</div>
			</React.Fragment>
		);
	}
}

export default Header;
