import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';

const LazyWalletRoutes = lazy(() => import('Approot/UI/components/WalletRoutes'));
const LazyPublicChatroom = lazy(() => import('Approot/UI/containers/Chatroom/Public'));
const LazyPrivateChatroom = lazy(() => import('Approot/UI/containers/Chatroom/Private'));
const LazyHome = lazy(() => import('Approot/UI/containers/Home'));
const LazyTopicInfoList = lazy(() => import('Approot/UI/containers/Topics'));

const Loader = (
	<div className="section">
		<div className="icon is-large loader" />
	</div>
);

const MainRoutes = () => (
	<Suspense fallback={Loader}>
		<Switch>
			<Route path="/chat/:topic" component={LazyPublicChatroom} />
			<Route path="/whisper/:recipient" component={LazyPrivateChatroom} />
			<Route path="/topics" component={LazyTopicInfoList} />
			<Route path="/wallets" component={LazyWalletRoutes} />
			<Route path="/" component={LazyHome} />
		</Switch>
	</Suspense>
);

export default MainRoutes;
