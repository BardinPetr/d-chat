let configs = localStorage.getItem('dchat');
if (configs) {
	configs = JSON.parse(configs);
}
export default {
	$loaded: Promise.resolve(),
	// Wallets. 1-to-1 client:wallet.
	clientsMeta: configs ? [configs] : [],

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
};
