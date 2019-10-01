export { wrapStore, alias } from 'webext-redux';
import sleep from 'sleep-promise';
import semver from 'semver';
import { runtime } from 'webextension-polyfill';

export const onInstalled = store =>
	runtime.onInstalled.addListener(async details => {
		if (!store) {
			await sleep(200);
		}
		if (details.previousVersion) {
			// From v4.0.0, we parse messages when we receive them, instead of when they're displayed. Older messages will be bad, so remove them.
			if (semver.lt(details.previousVersion, '4.0.0')) {
				store.dispatch({ type: 'chat/CLEAN_ALL' });
			}
			// There was an error in 4.0.0.
			if (semver.lt(details.previousVersion, '4.0.4')) {
				store.dispatch({ type: 'chat/CLEAN_REACTIONS' });
			}
		}

		setTimeout(
			() =>
				details.reason === 'install' &&
				browser.tabs.create({
					url: browser.runtime.getURL('sidebar.html?register'),
				}),
			250,
		); // Sometimes the register screen would bug out.
	});
