/* global Configs */

export default new Configs({
	// Wallets. 1-to-1 client:wallet.
	clientsMeta: [],

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
