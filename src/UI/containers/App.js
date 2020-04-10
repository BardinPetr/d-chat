import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import PrivateRoute from 'Approot/UI/containers/PrivateRoute';
import LoginBox from 'Approot/UI/containers/LoginBox';
import Portals from 'Approot/UI/components/Portals';
import 'Approot/UI/styles/mystyles.scss';
import history from 'Approot/UI/history';
import { joinChat, navigated } from 'Approot/redux/actions';
import { IS_SIDEBAR, getTopicFromPathname } from 'Approot/misc/util';

const App = async (store) => {
	/**
	 * Subscribes to chats when they're opened.
	 * Very separated from other logic, but it's fine.
	 */
	const subscribeToChatOnNavigation = () => {
		const topic = getTopicFromPathname(location.hash);

		if (topic == null) {
			return;
		}

		store.dispatch(joinChat(topic));
	};

	history.listen(() => {
		subscribeToChatOnNavigation();
		// Only popup deals with navigation saving.
		if (!IS_SIDEBAR) {
			store.dispatch(navigated(location.hash.slice(1)));
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
