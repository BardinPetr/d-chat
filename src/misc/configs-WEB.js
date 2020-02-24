let configs = localStorage.getItem('dchat');
if (configs) {
	configs = JSON.parse(configs);
}
export default {
	$loaded: Promise.resolve(),
	// Wallets. 1-to-1 client:wallet.
	clientsMeta: configs ? [configs] : [],

	globalSettings: {
		muted: []
	},
	chatSettings: {},
	showNotifications: true,
};
