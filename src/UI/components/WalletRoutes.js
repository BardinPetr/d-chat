import React from 'react';
import { Route, Switch } from 'react-router-dom';
import WalletImporter from 'Approot/UI/containers/Client/WalletImporter';
import NewWallet from 'Approot/UI/containers/Client/NewWallet';
import Clients from 'Approot/UI/containers/Client/List';

const WalletRoutes = ({ match }) => (
	<Switch>
		<Route
			path={`${match.path}/import`}
			component={WalletImporter}
		/>
		<Route
			path={`${match.path}/new`}
			component={NewWallet}
		/>
		<Route
			path={`${match.path}`}
			component={Clients}
		/>
	</Switch>
);

export default WalletRoutes;
