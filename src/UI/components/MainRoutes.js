import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import Loader from 'Approot/UI/components/Spinner';
import Chatroom from 'Approot/UI/containers/Chatroom';

const LazyHome = lazy(() => import('Approot/UI/containers/Home'));
const LazyTopicInfoList = lazy(() => import('Approot/UI/containers/Topics'));
const LazyOptions = lazy(() => import('Approot/UI/containers/Options'));

const MainRoutes = () => (
	<Suspense fallback={Loader}>
		<Switch>
			<Route path="/(chat|whisper)/*" component={Chatroom} />
			<Route path="/topics" component={LazyTopicInfoList} />
			<Route path="/options" component={LazyOptions} />
			<Route path="/" component={LazyHome} />
		</Switch>
	</Suspense>
);

export default MainRoutes;
