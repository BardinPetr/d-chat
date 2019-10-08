import React from 'react';
import { connect } from 'react-redux';
import { logout } from 'Approot/redux/actions';
import history from 'Approot/UI/history';
import sleep from 'sleep-promise';

const Logout = ({ className, children, logout }) => (
	<a className={className} onClick={logout}>
		{children}
	</a>
);

const mapDispatchToProps = dispatch => ({
	logout: () => {
		dispatch(logout());
		sleep(100).then(() => history.push('/login'));
	},
});

export default connect(null, mapDispatchToProps)(Logout);
