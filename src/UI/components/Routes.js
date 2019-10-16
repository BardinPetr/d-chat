import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from 'Approot/UI/containers/Home';
import PublicChatroom from 'Approot/UI/containers/Chatroom/Public';
import PrivateChatroom from 'Approot/UI/containers/Chatroom/Private';
import Header from 'Approot/UI/components/Header';
import Sidebar from 'Approot/UI/components/Sidebar';
import TopicInfoList from 'Approot/UI/containers/TopicInfoList';
import WalletRoutes from 'Approot/UI/components/WalletRoutes';
import ChatroomSidebar from 'Approot/UI/containers/Chatroom/Sidebar';

const Routes = () => (
	<div className="dashboard">
		<div className="dashboard-panel is-one-quarter is-paddingless is-scrollable">
			<Route path="/" component={Sidebar} />
		</div>
		<main className="dashboard-main x-main">
			<Route path="/" component={Header} />
			<section className="hero is-fullheight-with-navbar">
				<div className="hero-body is-paddingless x-is-align-start">
					<Switch>
						<Route path="/chat/:topic" component={PublicChatroom} />
						<Route path="/whisper/:recipient" component={PrivateChatroom} />
						<Route path="/topics" component={TopicInfoList} />
						<Route path="/wallets" component={WalletRoutes} />
						<Route path="/" component={Home} />
					</Switch>
				</div>
			</section>
		</main>
		<Route path="/(chat|whisper)/:topic" component={ChatroomSidebar} />
	</div>
);

export default Routes;
