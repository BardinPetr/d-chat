export { wrapStore, alias } from 'webext-redux';
import { runtime } from 'webextension-polyfill';

export const onInstalled = () =>
	runtime.onInstalled.addListener(async details => {
		setTimeout(
			() =>
				details.reason === 'install' &&
				browser.tabs.create({
					url: browser.runtime.getURL('index.html'),
				}),
			250,
		); // Sometimes the register screen would bug out.
	});
