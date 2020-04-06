/**
 * Options page can be removed once Firefox fixes permissions.request.
 * Related: https://bugzilla.mozilla.org/show_bug.cgi?id=1613796
 */
const x = document.querySelector('#grant');
x.addEventListener('click', () => {
	chrome.permissions.request({ permissions: ['notifications'] }, (r, e) => {
		console.log('res', r, e);
	});
});
const y = document.querySelector('#revoke');
y.addEventListener('click', () => {
	chrome.permissions.remove({ permissions: ['notifications'] }, (r, e) => {
		console.log('res', r, e);
	});
});
