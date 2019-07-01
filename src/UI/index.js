import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';
import App from './containers/App';

const store = new Store();

const renderApp = () => store.ready().then(() => ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>
	, document.getElementById('root')
));

export default renderApp;
