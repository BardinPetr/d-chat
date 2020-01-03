import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, matchPath, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import PrivateRoute from 'Approot/UI/containers/PrivateRoute';
import LoginBox from 'Approot/UI/containers/LoginBox';
import Portals from 'Approot/UI/components/Portals';
import 'Approot/UI/styles/mystyles.scss';
import history from 'Approot/UI/history';
import { joinChat, enterPrivateChat, navigated } from 'Approot/redux/actions';
import { IS_SIDEBAR } from 'Approot/misc/util';

const App = async (store) => {
	/**
	 * Subscribes to chats when they're opened.
	 * Very separated from other logic, but it's fine.
	 */
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
		// Only popup deals with navigation saving.
		if (!IS_SIDEBAR) {
			store.dispatch(navigated(location.pathname));
		}
	});

	ReactDOM.render(
		<Provider store={store}>
			<Router>
				<Switch>
					<Route path="/login" component={LoginBox} />
					<PrivateRoute
						path="/"
						component={Portals}
					/>
				</Switch>
			</Router>
		</Provider>
		, document.getElementById('root')
	);
};

export default App;
