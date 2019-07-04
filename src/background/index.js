import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { wrapStore, alias } from 'webext-redux';
import rootReducer from '../redux/reducers';
import aliases from '../redux/aliases';
import configs from '../misc/configs';
import { login } from '../redux/actions';
// Even a bit of obfuscation is better than none for "remember me".
import passworder from 'browser-passworder';

const password = 'd-chat!!!';

let credentials = localStorage.getItem('credentials');
if (credentials) {
	try {
		credentials = JSON.parse(credentials);
	} catch(e) {
		credentials = undefined;
	}
}

configs.$loaded.then(() => {
	const store = createStore(
		rootReducer,
		applyMiddleware(
			alias(aliases),
			thunkMiddleware
		)
	);

	wrapStore( store );

	if ( credentials ) {
		passworder.decrypt(password, credentials)
			.then(creds => store.dispatch(login(creds)));
	}

	// Store state at regular interval, excluding browser startup. Awful workaround.
	// Should probably just update the state on every message, instead.
	setTimeout(
		() => setInterval(() => configs.messages = store.getState().messages, 1000 * 10)
		, 1000
	);
});

browser.runtime.onInstalled.addListener(details => (
	setTimeout(() => details.reason === 'install' && browser.tabs.create({
		url: browser.runtime.getURL('popup.html?register')
	}), 250) // Sometimes the register screen would bug out.
));
