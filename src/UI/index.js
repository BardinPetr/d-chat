import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
// import { Store, applyMiddleware } from 'webext-redux';
import { Store } from 'webext-redux';
// import thunkMiddleware from 'redux-thunk';
import App from './containers/App';

// const middleware = [thunkMiddleware];
// const store = applyMiddleware(new Store(), ...middleware);
const store = new Store();
console.log( 'hello store!:', store );

const renderApp = () => store.ready().then(() => ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>
	, document.getElementById('root')
));

export default renderApp;
