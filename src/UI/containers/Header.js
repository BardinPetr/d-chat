import React from 'react';
import { matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem } from 'rc-menu';
import '../rc-dropdown.css';
import { IoMdOpen } from 'react-icons/io';
import { __, getChatDisplayName } from '../../misc/util';
import { runtime, tabs, windows } from 'webextension-polyfill';
import SubscriberList from '../containers/SubscriberList';
import SidebarToggle from '../containers/Sidebar/SidebarToggle';

const popout = type => {
	switch (type) {
		case 'panel':
			windows.create({
				url: runtime.getURL('sidebar.html'),
				type: 'panel',
				height: 700,
				width: 550,
			});
			break;

		case 'tab':
			tabs.create({
				url: runtime.getURL('sidebar.html'),
			});
			break;
	}
};

const MyMenu = (
	<Menu selectedKeys={[]} className="dropdown">
		<MenuItem className="dropdown-item" onClick={() => popout('panel')} key="1">{__('Panel')}</MenuItem>
		<MenuItem className="dropdown-item" onClick={() => popout('tab')} key="2">{__('Tab')}</MenuItem>
	</Menu>
);

const Popout = () => (
	<span className="new popout">
		<Dropdown
			trigger={['click']}
			overlay={MyMenu}
		>
			<IoMdOpen title={ __('Pop Out') } />
		</Dropdown>
	</span>
);

class Header extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			topic: '',
		};
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
		)?.params.topic || null;

		return (
			<header className="chat-header">

				{ topic ? (
					<span className="chatroom-header">
						<SidebarToggle />
						<span className="chatname" title={getChatDisplayName(topic)}>{getChatDisplayName(topic)}</span>
						<SubscriberList topic={topic} />
					</span>
				) : (
					<span className="chatlist-header">
						<SidebarToggle />
						<span className="chatname">{ __('D-Chat') }</span>
						<Popout />
					</span>
				)
				}
			</header>
		);
	}
}

export default connect()(Header);
