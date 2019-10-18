import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import { wrapStore, alias, onInstalled } from './operations-APP_TARGET';
import createWorkerMiddleware from 'redux-worker-middleware';
import rootReducer from '../redux/reducers';
import aliases from '../redux/aliases';
import configs from '../misc/configs-APP_TARGET';
import { login } from '../redux/actions';
// Even a bit of obfuscation is better than none for "remember me".
import passworder from 'browser-passworder';
import NKNWorker from 'Approot/workers/nkn.worker.js';
import notifierMiddleware from 'Approot/redux/middleware/notifier';
import confirmerMiddleware from 'Approot/redux/middleware/messageSentConfirmer';
import { IS_EXTENSION } from 'Approot/misc/util';

const password = 'd-chat!!!';

const nknWorker = new NKNWorker();

const workerMiddleware = createWorkerMiddleware(nknWorker);

let credentials;
if (IS_EXTENSION) {
	credentials = localStorage.getItem('credentials');
	if (credentials) {
		try {
			credentials = JSON.parse(credentials);
		} catch(e) {
			credentials = undefined;
		}
	}
}

let store;
export default configs.$loaded.then(() => {
	const persistedState = {
		clients: configs.clientsMeta,
		messages: configs.messages,
		reactions: configs.reactions,
		chatSettings: configs.chatSettings,
	};
	store = createStore(
		rootReducer,
		persistedState,
		composeWithDevTools(
			applyMiddleware(
				workerMiddleware,
				alias(aliases),
				confirmerMiddleware,
				notifierMiddleware,
				thunkMiddleware
			)
		)
	);

	wrapStore( store );

	if ( IS_EXTENSION && credentials ) {
		passworder.decrypt(password, credentials)
			.then(creds => store.dispatch(login(creds)));
	}
	return store;
});

onInstalled(store);
