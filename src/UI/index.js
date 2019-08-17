import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import PrivateRoute from './containers/PrivateRoute';
import LoginBox from './containers/LoginBox';
import Routes from './components/Routes';

const store = new Store();

const renderApp = () => store.ready().then(() => ReactDOM.render(
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
