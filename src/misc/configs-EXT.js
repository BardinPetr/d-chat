/* global Configs */

export default new Configs({
	// Wallets. 1-to-1 client:wallet.
	clientsMeta: [],

	globalSettings: {
		muted: []
	},
	chatSettings: {},

	notifications: false,
	audioNotifications: true,

	// These 2 were before optional_permissions
	// Extension options page setting.
	// showNotifications: true,
	// playNotificationSound: true,

	/** Deprecated configs */
	// message: { [topic]: [] }
	// messages: {},
	// reactions: { [topic]: { [messageId]: [] } }
	// reactions: {},
	// Confirmed transactions only.
	// transactions: {
	// 	confirmed: [],
	// },
});
