/**
 * Contains main routes. Users are redirected to /login if not logged in and before getting here.
 */
import React, { lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';

const Loader = (
	<div className="section">
		<div className="icon is-large loader" />
	</div>
);
const LazySidebar = lazy(() => import('Approot/UI/components/Sidebar'));
const LazyHeader = lazy(() => import('Approot/UI/components/Header'));
const LazyRoutes = lazy(() => import('Approot/UI/components/MainRoutes'));

const Routes = () => (
	<React.Fragment>
		{createPortal((
			<Suspense fallback={<div className="" />}>
				<LazySidebar />
			</Suspense>
		), document.getElementById('sidebar-root'))}

		{createPortal((
			<Suspense fallback={<div className="" />}>
				<LazyHeader />
			</Suspense>
		), document.getElementById('header-root'))}

		{createPortal((
			<Suspense fallback={Loader}>
				<LazyRoutes />
			</Suspense>
		), document.getElementById('chatroom-root'))}
	</React.Fragment>
);

export default Routes;
