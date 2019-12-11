/* global Configs */

export default new Configs({
	// Wallets. 1-to-1 client:wallet.
	clientsMeta: [],

	chatSettings: {},
	showNotifications: true,

	/** Deprecated configs */
	// message: { [topic]: [] }
	messages: {},
	// reactions: { [topic]: { [messageId]: [] } }
	reactions: {},
	// Confirmed transactions only.
	transactions: {
		confirmed: [],
	},
});
