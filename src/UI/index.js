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
import { joinChat, navigated } from 'Approot/redux/actions';

const store = new Store();

const renderApp = () => store.ready().then(() => {
	history.push(store.state.navigation.mostRecentPage);
	history.listen((location) => {
		const match = matchPath(location.pathname, {
			path: '/chat/:topic',
		});
		if (match != null) {
			store.dispatch(joinChat(match.params.topic));
		}
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
