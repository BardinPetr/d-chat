import React from 'react';
import { Link } from 'react-router-dom';
import { __ } from 'Approot/misc/util';
import TopicsList from 'Approot/UI/containers/TopicsList';
import NewTopicForm from 'Approot/UI/components/NewTopicForm';
import Logout from 'Approot/UI/containers/Logout';

const Sidebar = () => (
	<aside className="menu section is-hidden-mobile x-is-fullheight">
		<p className="menu-label is-hidden-touch">{__('General')}</p>
		<ul className="menu-list">
			<li>
				<Link to="/">{__('Home')}</Link>
			</li>
		</ul>

		<p className="menu-label is-hidden-touch">{__('Channels')}</p>
		<TopicsList />

		<label className="menu-label is-hidden-touch">
			{__('Add a channel')}
		</label>
		<NewTopicForm />

		<label className="menu-label is-hidden-touch">
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
