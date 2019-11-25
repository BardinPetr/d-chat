/**
 * Has routes for the 3-dots header button.
 */
import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import Loader from 'Approot/UI/components/Spinner';
import DefaultDots from 'Approot/UI/components/Header/DefaultDots';

const LazyChatroom = lazy(() => import('Approot/UI/containers/Header/ChatroomDots'));

const DotRoutes = () => (
	<>
		<Suspense fallback={Loader}>
			<Route path="/(chat|whisper)/:topic" component={LazyChatroom} />
		</Suspense>
		<Route path="/" component={DefaultDots} />
	</>
);

export default DotRoutes;
