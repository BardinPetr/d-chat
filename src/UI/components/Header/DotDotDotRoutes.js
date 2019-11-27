/**
 * Has routes for the 3-dots header button.
 */
import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import Loader from 'Approot/UI/components/Spinner';
import DefaultDots from 'Approot/UI/components/Header/DefaultDots';

const LazyChatroomDots = lazy(() => import('Approot/UI/containers/Header/ChatroomDots'));

const DotRoutes = () => (
	<>
		<Suspense fallback={Loader}>
			<Route path="/chat/:topic" component={LazyChatroomDots} />
			<Route path="/whisper/:recipient" component={LazyChatroomDots} />
		</Suspense>
		<Route path="/" component={DefaultDots} />
	</>
);

export default DotRoutes;