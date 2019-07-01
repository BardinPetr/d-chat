import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { wrapStore, alias } from 'webext-redux';
import rootReducer from '../redux/reducers';
import aliases from '../redux/aliases';
import configs from '../misc/configs';

configs.$loaded.then(() => {
	const store = createStore(
		rootReducer,
		applyMiddleware(
			alias(aliases),
			thunkMiddleware
		)
	);

	wrapStore( store );

	browser.runtime.onInstalled.addListener(() => browser.tabs.create({
		url: browser.runtime.getURL('popup.html?register')
	}));

	// Store state at regular interval, excluding browser startup. Awful workaround.
	// Should probably just update the state on every message, instead.
	setTimeout(
		setInterval(() => configs.messages = store.getState().messages, 1000 * 10)
		, 1000
	);

	// Does not work in background page.
	// window.addEventListener('beforeunload', e => {
	// 	// ??????
	// 	e.returnValue = '';
	// 	configs.messages = store.getState().messages;
	// });
});
