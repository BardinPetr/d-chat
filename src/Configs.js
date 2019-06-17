/* global Configs */

export default new Configs({
	walletJSON: null,
	chats: {},
	password: null,
	state: {},
}, {
	// Set all keys to use sync.
	localKeys: [ 'password', 'state' ],
});
