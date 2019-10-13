import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from 'Approot/UI/containers/Home';
import PublicChatroom from 'Approot/UI/containers/Chatroom/Public';
import PrivateChatroom from 'Approot/UI/containers/Chatroom/Private';
import Header from 'Approot/UI/components/Header';
import Sidebar from 'Approot/UI/components/Sidebar';
import TopicInfoList from 'Approot/UI/containers/TopicInfoList';
import WalletRoutes from 'Approot/UI/components/WalletRoutes';

const Routes = () => (
	<div className="dashboard">
		<div className="dashboard-panel is-one-quarter is-scrollable">
			<Route path="/" component={Sidebar} />
		</div>
		<div className="dashboard-main">
			<div className="">
				<Route path="/" component={Header} />
				<section className="hero is-fullheight-with-navbar">
					<Switch>
						<Route path="/chat/:topic" component={PublicChatroom} />
						<Route path="/whisper/:recipient" component={PrivateChatroom} />
						<Route path="/topics" component={TopicInfoList} />
						<Route path="/wallets" component={WalletRoutes} />
						<Route path="/" component={Home} />
					</Switch>
				</section>
			</div>
		</div>
		<div className="dashboard-panel is-small is-scrollable"></div>
	</div>
);

export default Routes;
