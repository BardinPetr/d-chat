import React from 'react';
import { Link } from 'react-router-dom';
import { __ } from 'Approot/misc/browser-util';
import TopicsList from 'Approot/UI/containers/TopicsList';
import Logout from 'Approot/UI/containers/Logout';
import Popout from 'Approot/UI/components/Popout';

const Sidebar = () => (
	<aside className="menu section is-hidden-mobile x-is-fullheight x-is-small-padding" style={{overflowX: 'hidden'}}>
		<ul className="menu-list">
			<li>
				<Link to="/">{__('Home')}</Link>
			</li>
		</ul>

		<p className="menu-label">{__('Channels')}</p>
		<TopicsList />

		<p className="menu-label">{__('Whispers')}</p>
		<TopicsList whispers />

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

		<p className="menu-label">{__('New view')}</p>
		<Popout />

	</aside>
);

export default Sidebar;
