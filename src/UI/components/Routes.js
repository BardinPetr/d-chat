/**
 * Contains main routes. Users are redirected to /login if not logged in and before getting here.
 */
import React from 'react';
import { createPortal } from 'react-dom';
import { Route, Switch } from 'react-router-dom';
import Home from 'Approot/UI/containers/Home';
import PublicChatroom from 'Approot/UI/containers/Chatroom/Public';
import PrivateChatroom from 'Approot/UI/containers/Chatroom/Private';
import Header from 'Approot/UI/components/Header';
import Sidebar from 'Approot/UI/components/Sidebar';
import TopicInfoList from 'Approot/UI/containers/TopicInfoList';
import WalletRoutes from 'Approot/UI/components/WalletRoutes';

const Routes = () => (
	<React.Fragment>
		{createPortal(<Sidebar />, document.getElementById('sidebar-root'))}

		{createPortal(<Header />, document.getElementById('header-root'))}

		{createPortal(
			<Switch>
				<Route path="/chat/:topic" component={PublicChatroom} />
				<Route path="/whisper/:recipient" component={PrivateChatroom} />
				<Route path="/topics" component={TopicInfoList} />
				<Route path="/wallets" component={WalletRoutes} />
				<Route path="/" component={Home} />
			</Switch>
			, document.getElementById('chatroom-root'))}
	</React.Fragment>
);

export default Routes;
