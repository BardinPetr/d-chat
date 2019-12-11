export { wrapStore, alias } from 'webext-redux';
import semver from 'semver';
import { runtime } from 'webextension-polyfill';
import upgrade from 'Approot/background/upgrade';
import configs from 'Approot/misc/configs-APP_TARGET';

export const onInstalled = storePromise =>
	runtime.onInstalled.addListener(async details => {
		const store = await storePromise;
		if (details.previousVersion) {
			// From v4.0.0, we parse messages when we receive them, instead of when they're displayed. Older messages will be bad, so remove them.
			if (semver.lt(details.previousVersion, '4.0.0')) {
				store.dispatch({ type: 'chat/CLEAN_ALL' });
			}
			// There was an error in 4.0.0.
			if (semver.lt(details.previousVersion, '4.0.4')) {
				store.dispatch({ type: 'chat/CLEAN_REACTIONS' });
			}
			// Upgrade to indexeddb.
			if (semver.lt(details.previousVersion, '5.0.0')) {
				await configs.$loaded;
				let data = {
					messages: { ...configs.messages },
					reactions: { ...configs.reactions },
				};
				upgrade(data);
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
