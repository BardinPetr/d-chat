/**
 * Attaches sidebar/header/chatroom.
 * Users are redirected to /login if not logged in and before getting here.
 */
import React from 'react';
import { createPortal } from 'react-dom';

import Sidebar from 'Approot/UI/components/Sidebar';
import Header from 'Approot/UI/components/Header';
import MainRoutes from 'Approot/UI/components/MainRoutes';

const Portals = () => (
	<React.Fragment>
		{createPortal((
			<Sidebar />
		), document.getElementById('sidebar-root'))}

		{createPortal((
			<Header />
		), document.getElementById('header-root'))}

		{createPortal((
			<MainRoutes />
		), document.getElementById('chatroom-root'))}
	</React.Fragment>
);

export default Portals;
