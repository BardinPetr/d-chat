/* global Configs */

export default new Configs({
	walletJSON: null,
	// message: { [topic]: [] }
	messages: {},
	// reactions: { [topic]: { [messageId]: [] } }
	reactions: {},
	showNotifications: true,
	chatSettings: {},
	// Confirmed transactions only.
	transactions: {
		confirmed: [],
	},
});
