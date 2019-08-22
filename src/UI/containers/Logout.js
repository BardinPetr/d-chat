import React from 'react';
import { connect } from 'react-redux';
import { logout } from 'Approot/redux/actions';
import history from 'Approot/UI/history';

const Logout = ({ className, children, dispatch }) => (
	<a className={className} onClick={() => {
		dispatch(logout()).then(() => history.push('/login'));
	}}>
		{children}
	</a>
);

export default connect()(Logout);
