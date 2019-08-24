import { runtime } from 'webextension-polyfill';

runtime.sendMessage({
	action: 'get_address',
}).then(key => {
	const input = document.querySelector('input#nkn');
	if ( key && input.value === '' ) {
		input.value = key;
		// Suddenly i18n is not working in content script.
		document.querySelector('.status-extra').innerText = ('Your address was automatically filled in by D-Chat.');
	}
});
