import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';
import { HashRouter as Router, matchPath, Route, Switch } from 'react-router-dom';
import PrivateRoute from './containers/PrivateRoute';
import LoginBox from './containers/LoginBox';
import Routes from './components/Routes';
import './styles/mystyles.scss';
import history from './history';
import { joinChat, enterPrivateChat, navigated } from 'Approot/redux/actions';

const store = new Store();

const renderApp = () => store.ready().then(() => {
	history.replace(store.state.navigation.mostRecentPage);

	const subscribeToNavigatedChat = (location) => {
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

	subscribeToNavigatedChat(history.location);

	history.listen((location) => {
		subscribeToNavigatedChat(location);
		store.dispatch(navigated(location.pathname));
	});
}).then(async () => ReactDOM.render(
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
));

export default renderApp;
