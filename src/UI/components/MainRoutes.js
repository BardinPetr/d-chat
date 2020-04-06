import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import Loader from 'Approot/UI/components/Spinner';
import PublicChatroom from 'Approot/UI/containers/Chatroom/Public';
import PrivateChatroom from 'Approot/UI/containers/Chatroom/Private';

const LazyHome = lazy(() => import('Approot/UI/containers/Home'));
const LazyTopicInfoList = lazy(() => import('Approot/UI/containers/Topics'));
const LazyOptions = lazy(() => import('Approot/UI/containers/Options'));

const MainRoutes = () => (
	<Suspense fallback={Loader}>
		<Switch>
			<Route path="/chat/*" component={PublicChatroom} />
			<Route path="/whisper/*" component={PrivateChatroom} />
			<Route path="/topics" component={LazyTopicInfoList} />
			<Route path="/options" component={LazyOptions} />
			<Route path="/" component={LazyHome} />
		</Switch>
	</Suspense>
);

export default MainRoutes;
