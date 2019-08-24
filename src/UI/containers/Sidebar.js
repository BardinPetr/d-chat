import React from 'react';
import { Link } from 'react-router-dom';
import { __ } from 'Approot/misc/util';
import TopicsList from 'Approot/UI/containers/TopicsList';
import NewTopicForm from 'Approot/UI/components/NewTopicForm';
import Logout from 'Approot/UI/containers/Logout';
import Popout from 'Approot/UI/components/Popout';

const Sidebar = () => (
	<aside className="menu section is-hidden-mobile x-is-fullheight x-is-small-padding">
		<p className="menu-label">{__('General')}</p>
		<ul className="menu-list">
			<li>
				<Link to="/">{__('Home')}</Link>
			</li>
		</ul>

		<p className="menu-label">{__('Channels')}</p>
		<TopicsList />

		<label className="menu-label">
			{__('Add a channel')}
		</label>
		<ul className="menu-list">
			<li className="x-input">
				<NewTopicForm />
			</li>
		</ul>

		<p className="menu-label">{__('New view')}</p>
		<Popout />

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

	</aside>
);

export default Sidebar;
