import React from 'react';
import { Route } from 'react-router-dom';
import Info from 'Approot/UI/components/Info';
import Chatroom from 'Approot/UI/containers/Chatroom';
import Header from 'Approot/UI/components/Header';
import Sidebar from 'Approot/UI/containers/Sidebar';
import Toastr from 'react-redux-toastr';
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';

const Routes = () => (
	<div className="columns is-gapless">
		<div className="column is-one-fifth">
			<Route
				path="/"
				component={Sidebar}
			/>
		</div>
		<div className="column">
			<Route
				path="/"
				component={Header}
			/>
			<section className="hero is-fullheight-with-navbar">
				<div className="hero-body is-paddingless x-is-align-start">
					<Route
						path="/chat/:topic"
						component={Chatroom}
					/>
					<Route
						path="/"
						exact={true}
						component={Info}
					/>
				</div>
			</section>
		</div>
		<Toastr
			timeOut={5000}
			transitionIn="bounceInDown"
			transitionOut="bounceOut"
			progressBar
			closeOnToastrClick
			className="is-size-7"
		/>
	</div>
);

export default Routes;
