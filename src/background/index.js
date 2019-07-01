import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { wrapStore, alias } from 'webext-redux';
import rootReducer from '../redux/reducers';
import aliases from '../redux/aliases';

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

// browser.runtime.onMessage.addListener(function (message) {
// 	console.log(message);
// });

