import React from 'react';
import { Route, Switch } from 'react-router-dom';
import TopicInfoList from 'Approot/UI/containers/Topics';
import WalletRoutes from 'Approot/UI/components/WalletRoutes';
import PublicChatroom from 'Approot/UI/containers/Chatroom/Public';
import PrivateChatroom from 'Approot/UI/containers/Chatroom/Private';
import Home from 'Approot/UI/containers/Home';

const MainRoutes = () => (
	<Switch>
		<Route path="/chat/:topic" component={PublicChatroom} />
		<Route path="/whisper/:recipient" component={PrivateChatroom} />
		<Route path="/topics" component={TopicInfoList} />
		<Route path="/wallets" component={WalletRoutes} />
		<Route path="/" component={Home} />
	</Switch>
);

export default MainRoutes;
