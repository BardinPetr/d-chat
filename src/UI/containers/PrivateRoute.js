import React from 'react';
import { connect } from 'react-redux';
import ReactPrivateRoute from '@sharyn/react-router.privateroute';

/*
 Known bug: a channel like 'a#b', with url-special signs like hash and question mark, -
 causes private route to redirect incorrectly. That happens because history -
 and react router packages don't like these things.
 They try to match hash withinin hash, and we don't like that one.

 It is a minor inconvenience, and not worth fixing for now.
*/
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
