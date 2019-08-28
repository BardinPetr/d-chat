import React from 'react';
import { Route } from 'react-router-dom';
import Home from 'Approot/UI/containers/Home';
import PublicChatroom from 'Approot/UI/containers/Chatroom/Public';
import PrivateChatroom from 'Approot/UI/containers/Chatroom/Private';
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
		<div className="column is-four-fifths x-is-fullheight">
			<Route
				path="/"
				component={Header}
			/>
			<section className="hero is-fullheight-with-navbar">
				<div className="hero-body is-paddingless x-is-align-start">
					<Route
						path="/chat/:topic"
						component={PublicChatroom}
					/>
					<Route
						path="/whisper/:recipient"
						component={PrivateChatroom}
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
