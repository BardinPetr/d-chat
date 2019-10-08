// eslint-disable-next-line
import React from 'react';
import ProvideCredentials from 'Approot/UI/components/ProvideCredentials';
import { connect } from 'react-redux';
import { newClient } from 'Approot/redux/actions/client';
import history from 'Approot/UI/history';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const mapStateToProps = () => ({
	callToAction: __('Add'),
	noPassword: true,
});

const mapDispatchToProps = dispatch => ({
	submit: async (credentials) => {
		dispatch(newClient(credentials.username, credentials.password));
		history.push('/wallets');
	},
});

export default connect(mapStateToProps, mapDispatchToProps)(ProvideCredentials);
