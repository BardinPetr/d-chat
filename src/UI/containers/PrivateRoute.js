import React from 'react';
import { connect } from 'react-redux';
import ReactPrivateRoute from 'react-router-private';

const PrivateRoute = ({ path, exact, component, authStatus }) => (
	<ReactPrivateRoute
		redirectURL="/login"
		path={path}
		exact={exact}
		component={component}
		authStatus={authStatus}
	/>
);

const mapStateToProps = state => {
	return ({
		authStatus: state.login?.addr != null && state.login?.connected,
	});
};

export default connect(mapStateToProps)(PrivateRoute);
