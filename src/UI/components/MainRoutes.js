import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import Loader from 'Approot/UI/components/Spinner';

const LazyPublicChatroom = lazy(() => import('Approot/UI/containers/Chatroom/Public'));
const LazyPrivateChatroom = lazy(() => import('Approot/UI/containers/Chatroom/Private'));
const LazyHome = lazy(() => import('Approot/UI/containers/Home'));
const LazyTopicInfoList = lazy(() => import('Approot/UI/containers/Topics'));

const MainRoutes = () => (
	<Suspense fallback={Loader}>
		<Switch>
			<Route path="/chat/*" component={LazyPublicChatroom} />
			<Route path="/whisper/*" component={LazyPrivateChatroom} />
			<Route path="/topics" component={LazyTopicInfoList} />
			<Route path="/" component={LazyHome} />
		</Switch>
	</Suspense>
);

export default MainRoutes;
