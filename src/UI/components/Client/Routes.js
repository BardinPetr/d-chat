import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Client from 'Approot/UI/containers/Client';
import Clients from 'Approot/UI/containers/Client/List';

const ClientRoutes = () => (
	<Switch>
		<Route
			path="/wallet/:address"
			component={Client}
		/>
		<Route
			path="/wallet"
			component={Clients}
		/>
	</Switch>
);

export default ClientRoutes;
