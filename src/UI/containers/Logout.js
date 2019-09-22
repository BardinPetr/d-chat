import React from 'react';
import { connect } from 'react-redux';
import { logout } from 'Approot/redux/actions';
import history from 'Approot/UI/history';
import sleep from 'sleep-promise';

const Logout = ({ className, children, dispatch }) => (
	<a className={className} onClick={() => {
		dispatch(logout()).then(() => sleep(100)).then(() => history.push('/login'));
	}}>
		{children}
	</a>
);

export default connect()(Logout);
