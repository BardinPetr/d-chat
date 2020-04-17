import { Store } from 'webext-redux';
import App from 'Approot/UI/containers/App';
import history from 'Approot/UI/history';
import { IS_SIDEBAR } from 'Approot/misc/util';

const store = new Store();

const renderApp = () => store.ready().then(() => {
	if (!IS_SIDEBAR) {
		if (store.state.navigation.mostRecentPage) {
			history.replace(store.state.navigation.mostRecentPage);
		}
	}

	App(store);
});

export default renderApp;
