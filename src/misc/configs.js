/* global Configs */

export default new Configs({
	walletJSON: null,
	// Wallets. 1-to-1 client:wallet.
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
