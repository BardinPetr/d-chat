import React from 'react';
import { Link } from 'react-router-dom';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import TopicsList from 'Approot/UI/containers/TopicsList';
import Popout from 'Approot/UI/components/Popout-APP_TARGET';

const Sidebar = () => (
	<aside className="menu x-sidebar">
		<ul className="menu-list">
			<li>
				<Link to="/">{__('Home')}</Link>
			</li>
			<li>
				<Link to="/topics">{__('Public')}</Link>
			</li>
			<li>
				<Link to="/options">{__('Options')}</Link>
			</li>
		</ul>

		<TopicsList labelClassName="menu-label" wrapperClassName="x-has-margin-top-bottom" />

		<Popout />

	</aside>
);

export default Sidebar;
