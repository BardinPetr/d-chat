import { activateClient } from 'Approot/redux/actions/client';
export { alias } from 'webext-redux';
/**
 * Adds created wallet to localStorage.
 */
export const wrapStore = store => {
	if (!localStorage.getItem('dchat')) {
		let current;
		const unsub = store.subscribe(() => {
			let previous = current;
			current = store.getState().clients[0]?.addr;
			if (previous !== current) {
				const infos = store.getState().clients[0];
				localStorage.setItem('dchat', JSON.stringify(infos));
				unsub();
			}
		});
	} else {
		const client = JSON.parse(localStorage.getItem('dchat'));
		store.dispatch(activateClient(client));
	}
};
export const onInstalled = () => {};
