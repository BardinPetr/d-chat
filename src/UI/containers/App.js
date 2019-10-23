import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, matchPath, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import PrivateRoute from 'Approot/UI/containers/PrivateRoute';
import LoginBox from 'Approot/UI/containers/LoginBox';
import Routes from 'Approot/UI/components/Routes';
import 'Approot/UI/styles/mystyles.scss';
import history from 'Approot/UI/history';
import { joinChat, enterPrivateChat, navigated } from 'Approot/redux/actions';

const App = async (store) => {
	const subscribeToChatOnNavigation = (location) => {
		let match = matchPath(location.pathname, {
			path: '/chat/:topic',
		});

		if (match != null) {
			store.dispatch(joinChat(match.params.topic));
		} else {
			match = matchPath(location.pathname, {
				path: '/whisper/:topic',
			});

			if (match != null) {
				store.dispatch(enterPrivateChat(match.params.topic));
			}
		}
	};

	subscribeToChatOnNavigation(history.location);

	history.listen((location) => {
		subscribeToChatOnNavigation(location);
		store.dispatch(navigated(location.pathname));
	});

	ReactDOM.render(
		<Provider store={store}>
			<Router>
				<Switch>
					<Route path="/login" component={LoginBox} />
					<PrivateRoute
						path="/"
						component={Routes}
					/>
				</Switch>
			</Router>
		</Provider>
		, document.getElementById('root')
	);
};

export default App;
