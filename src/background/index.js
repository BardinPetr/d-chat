import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { wrapStore, alias } from 'webext-redux';
import rootReducer from '../redux/reducers';
import aliases from '../redux/aliases';
import configs from '../misc/configs';
import { login } from '../redux/actions';
// Even a bit of obfuscation is better than none for "remember me".
import passworder from 'browser-passworder';
import { log } from 'Approot/misc/util';

const password = 'd-chat!!!';

let credentials = localStorage.getItem('credentials');
log('Credentials?', credentials != null);
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
		log('Using existing credentials');
		passworder.decrypt(password, credentials)
			.then(creds => store.dispatch(login(creds)));
	}

});

browser.runtime.onInstalled.addListener(details => (
	setTimeout(() => details.reason === 'install' && browser.tabs.create({
		url: browser.runtime.getURL('sidebar.html?register')
	}), 250) // Sometimes the register screen would bug out.
));

browser.runtime.onMessage.addListener((msg, _, sendResponse) => {
	if ( msg?.action === 'get_address' && window.nknClient ) {
		sendResponse(window.nknClient.wallet.address);
	}
});
