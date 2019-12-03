import { Store } from 'webext-redux';
import App from 'Approot/UI/containers/App';
import history from 'Approot/UI/history';

const store = new Store();

const renderApp = () => store.ready().then(() => {
	if (window.location.pathname.includes('popup.html')) {
		if (store.state.navigation.mostRecentPage){
			history.replace(store.state.navigation.mostRecentPage);
		}
	}

	App(store);
});

export default renderApp;
