import React from 'react';
import { Link } from 'react-router-dom';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import TopicsList from 'Approot/UI/containers/TopicsList';
import Logout from 'Approot/UI/containers/Logout';
import Popout from 'Approot/UI/components/Popout-APP_TARGET';
import { IS_EXTENSION } from 'Approot/misc/util';

const Sidebar = () => (
	<aside className="menu section">
		<ul className="menu-list">
			<li>
				<Link to="/">{__('Home')}</Link>
			</li>
			<li>
				<Link to="/topics">{__('Public')}</Link>
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
			{IS_EXTENSION && (
				<li>
					<Logout>
						{__('Log Out')}
					</Logout>
				</li>
			)}
		</ul>

		<Popout />

	</aside>
);

export default Sidebar;
