import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from 'Approot/UI/containers/Home';
import PublicChatroom from 'Approot/UI/containers/Chatroom/Public';
import PrivateChatroom from 'Approot/UI/containers/Chatroom/Private';
import Header from 'Approot/UI/components/Header';
import Sidebar from 'Approot/UI/components/Sidebar';
import Clients from 'Approot/UI/containers/Client/List';
import WalletImporter from 'Approot/UI/containers/Client/WalletImporter';
import NewWallet from 'Approot/UI/containers/Client/NewWallet';

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
					<Switch>
						<Route
							path="/chat/:topic"
							component={PublicChatroom}
						/>
						<Route
							path="/whisper/:recipient"
							component={PrivateChatroom}
						/>
						<Route
							exact
							path="/wallets/import"
							component={WalletImporter}
						/>
						<Route
							exact
							path="/wallets/new"
							component={NewWallet}
						/>
						<Route
							path="/wallets"
							component={Clients}
						/>
						<Route
							path="/"
							component={Home}
						/>
					</Switch>
				</div>
			</section>
		</div>
	</div>
);

export default Routes;
