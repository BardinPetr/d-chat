import { Store } from 'webext-redux';
import App from 'Approot/UI/components/App';

const store = new Store();

const renderApp = async () => {
	App(store);
};

export default renderApp;
