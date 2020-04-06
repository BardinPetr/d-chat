let Options = {
	$loaded: Promise.resolve(),
	// Wallets. 1-to-1 client:wallet.
	clientsMeta: [],

	globalSettings: {
		muted: []
	},
	chatSettings: {},

	notifications: false,
	audioNotifications: true,
};

let configs = localStorage.getItem('dchat');
if (configs) {
	configs = JSON.parse(configs);
	Options.clientsMeta = configs ? [configs] : [];
}

const c2 = localStorage.getItem('dchatv2');
if (c2) {
	Options = JSON.parse(c2);
	Options.$loaded = Promise.resolve();
}

const handler = {
	set: function(obj, prop, value) {
		if (prop !== '$loaded') {
			obj[prop] = value;
			localStorage.setItem('dchatv2', JSON.stringify(obj));
		}
		return true;
	}
};

let opts;
if (Proxy) {
	opts = new Proxy(Options, handler);
} else {
	opts = Options;
}

export default opts;
