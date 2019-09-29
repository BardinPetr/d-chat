import React from 'react';
import { Route, Switch } from 'react-router-dom';
import WalletImporter from 'Approot/UI/containers/Client/WalletImporter';
import NewWallet from 'Approot/UI/containers/Client/NewWallet';
import Clients from 'Approot/UI/containers/Client/List';

const WalletRoutes = () => (
	<Switch>
		<Route
			path="/import"
			component={WalletImporter}
		/>
		<Route
			path="/new"
			component={NewWallet}
		/>
		<Route
			path="/"
			component={Clients}
		/>
	</Switch>
);

export default WalletRoutes;
