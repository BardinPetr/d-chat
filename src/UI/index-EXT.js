import { Store } from 'webext-redux';
import App from 'Approot/UI/containers/App';
import history from 'Approot/UI/history';
import configs from 'Approot/misc/configs-APP_TARGET';

const store = new Store();

const renderApp = () => store.ready().then(async () => {
	await configs.$loaded;
	if (window.location.pathname.includes('popup.html')) {
		if (store.state.navigation.mostRecentPage){
			history.replace(store.state.navigation.mostRecentPage);
		}
	}

	App(store);
});

export default renderApp;
