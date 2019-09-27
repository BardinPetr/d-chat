import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { wrapStore, alias } from 'webext-redux';
import createWorkerMiddleware from 'redux-worker-middleware';
import rootReducer from '../redux/reducers';
import aliases from '../redux/aliases';
import configs from '../misc/configs';
import { login } from '../redux/actions';
// Even a bit of obfuscation is better than none for "remember me".
import passworder from 'browser-passworder';
import { log } from 'Approot/misc/util';
import NKNWorker from 'Approot/workers/nkn.worker.js';
import semver from 'semver';
import notifierMiddleware from 'Approot/redux/middleware/notifier';
import sleep from 'sleep-promise';

const password = 'd-chat!!!';

const nknWorker = new NKNWorker();

const workerMiddleware = createWorkerMiddleware(nknWorker);

let credentials = localStorage.getItem('credentials');
log('Credentials?', credentials != null);
if (credentials) {
	try {
		credentials = JSON.parse(credentials);
	} catch(e) {
		credentials = undefined;
	}
}

let store;
configs.$loaded.then(() => {
	store = createStore(
		rootReducer,
		applyMiddleware(
			workerMiddleware,
			alias(aliases),
			notifierMiddleware,
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

browser.runtime.onInstalled.addListener(async details => {
	if (!store) {
		await sleep(200);
	}
	if (details.previousVersion) {
		// From v4.0.0, we parse messages when we receive them, instead of when they're displayed. Older messages will be bad, so remove them.
		if (semver.lt(details.previousVersion, '4.0.0')) {
			store.dispatch({type: 'chat/CLEAN_ALL'});
		}
		// There was an error in 4.0.0.
		if (semver.lt(details.previousVersion, '4.0.4')) {
			store.dispatch({type: 'chat/CLEAN_REACTIONS'});
		}
	}

	setTimeout(() => details.reason === 'install' && browser.tabs.create({
		url: browser.runtime.getURL('sidebar.html?register')
	}), 250); // Sometimes the register screen would bug out.
});
