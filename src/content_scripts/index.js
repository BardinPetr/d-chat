import { __ } from 'Approot/misc/util';
import { runtime } from 'webextension-polyfill';

runtime.sendMessage({
	action: 'get_address',
}).then(key => {
	const input = document.querySelector('input#nkn');
	if ( key && input.value === '' ) {
		input.value = key;
		document.querySelector('.status-extra').innerText = __('Your address was automatically filled in by d-chat.');
	} else if (input.value === '') {
		document.querySelector('.status-extra').innerText = __('Log in to d-chat (and then refresh) to have your NKN address automatically filled.');
	}
});
