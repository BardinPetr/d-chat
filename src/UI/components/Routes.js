import React from 'react';
import { Route } from 'react-router-dom';
import Home from 'Approot/UI/containers/Home';
import Chatroom from 'Approot/UI/containers/Chatroom';
import Header from 'Approot/UI/components/Header';
import Sidebar from 'Approot/UI/containers/Sidebar';

const Routes = () => (
	<div className="columns is-gapless">
		<div className="column is-one-fifth">
			<Route
				path="/"
				component={Sidebar}
			/>
		</div>
		<div className="column is-four-fifths">
			<Route
				path="/"
				component={Header}
			/>
			<section className="hero is-fullheight-with-navbar">
				<div className="hero-body is-paddingless x-is-align-start">
					<Route
						path="/chat/:topic"
						component={Chatroom}
					/>
					<Route
						path="/"
						exact={true}
						component={Home}
					/>
				</div>
			</section>
		</div>
	</div>
);

export default Routes;
