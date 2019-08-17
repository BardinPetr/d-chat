import React from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
// import { getBalance, logout, login, joinChat } from '../../redux/actions';
import ChatList from '../containers/ChatList';
import Chatroom from '../containers/Chatroom';
// import PrivateRoute from '../containers/PrivateRoute';
import Header from '../containers/Header';
import Sidebar from '../containers/Sidebar';

const Routes = () => (
	<div className="app-container">
		<Route
			path="/"
			component={Sidebar}
		/>

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
	</div>
);

export default connect()(Routes);
