export const switchToClient = (client) => ({
	type: 'nkn/SWITCH_TO_CLIENT',
	payload: {
		client,
	},
});

export const newWallet = (wallet) => ({
	type: 'nkn/NEW_WALLET',

});
