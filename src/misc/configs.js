/* global Configs */

export default new Configs({
	// First wallet to be created goes here.
	walletJSON: null,
	// Wallets. 1-to-1 client:wallet.
	// Front end.
	clientsMeta: [],
	// Back end.
	clients: [],

	// message: { [topic]: [] }
	messages: {},
	// reactions: { [topic]: { [messageId]: [] } }
	reactions: {},
	chatSettings: {},
	// Confirmed transactions only.
	transactions: {
		confirmed: [],
	},
	showNotifications: true,
});
