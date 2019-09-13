/**
 * Contains actions for /wallets/*
 */

export const switchToClient = (address) => ({
	type: 'nkn/SWITCH_TO_CLIENT_ALIAS',
	payload: {
		address,
	},
});

export const createNewClient = (client) => ({
	type: 'nkn/CREATE_NEW_CLIENT',
	payload: {
		client,
	},
});

export const importWallet = ({walletJSON, password, username}) => ({
	type: 'nkn/IMPORT_WALLET_ALIAS',
	payload: {
		walletJSON,
		password,
		username,
	},
});

export const newClient = (username) => ({
	type: 'nkn/NEW_CLIENT_ALIAS',
	payload: {
		username,
	},
});

export const exportWallet = (address) => ({
	type: 'nkn/EXPORT_WALLET_ALIAS',
	payload: {
		address,
	},
});
