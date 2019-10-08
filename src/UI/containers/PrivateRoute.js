import React from 'react';
import { connect } from 'react-redux';
import ReactPrivateRoute from '@sharyn/react-router.privateroute';

const PrivateRoute = ({ path, component, authStatus }) => (
	<ReactPrivateRoute
		path={path}
		redirectPath="/login"
		component={component}
		loggedIn={!!authStatus}
	/>
);

const mapStateToProps = state => {
	return ({
		authStatus: state.login?.addr != null && state.login?.connected,
	});
};

export default connect(mapStateToProps)(PrivateRoute);
