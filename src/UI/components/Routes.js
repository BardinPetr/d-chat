import React from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
// import { getBalance, logout, login, joinChat } from '../../redux/actions';
import ChatList from 'Approot/UI/containers/ChatList';
import Chatroom from 'Approot/UI/containers/Chatroom';
// import PrivateRoute from '../containers/PrivateRoute';
import Header from 'Approot/UI/containers/Header';
import Sidebar from 'Approot/UI/containers/Sidebar';

const Routes = () => (
	<div className="app-container">
		<Sidebar>
			<div className="app">
				<Route
					path="/"
					component={Header}
				/>
				<Route
					path="/chat/:topic"
					component={Chatroom}
				/>
				<Route
					path="/"
					exact={true}
					component={ChatList}
				/>
			</div>
		</Sidebar>
	</div>
);

export default connect()(Routes);
