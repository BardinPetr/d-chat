import { __ } from 'Approot/misc/util';

browser.runtime.sendMessage({
	action: 'get_address',
}).then(key => {
	if ( key ) {
		document.querySelector('input#nkn').value = key;
		document.querySelector('.status-extra').innerText = __('Your address was automatically filled in by d-chat.');
	} else {
		document.querySelector('.status-extra').innerText = __('Log in to d-chat (and then refresh) to have your NKN address automatically filled.');
	}
});
