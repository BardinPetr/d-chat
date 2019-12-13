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
import subscribersFetcher from 'Approot/redux/middleware/subFetcher';
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

const creatingStore = configs.$loaded.then(async () => {

	const persistedState = {
		clients: configs.clientsMeta,
		chatSettings: configs.chatSettings,
	};

	const store = createStore(
		rootReducer,
		persistedState,
		composeWithDevTools(
			applyMiddleware(
				workerMiddleware,
				alias(aliases),
				notifierMiddleware,
				subscribersFetcher,
				thunkMiddleware
			)
		)
	);

	wrapStore(store);

	if (IS_EXTENSION && credentials) {
		passworder.decrypt(password, credentials)
			.then(creds => {
				const activeClient = store.getState().clients.find(c => c.active);
				const address = activeClient?.wallet.Address;
				if (address) {
					store.dispatch(login(creds, address));
				}
			});
	}
	return store;
});

onInstalled(creatingStore);

export default creatingStore;
