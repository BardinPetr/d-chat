/**
 * Contains actions for `nkn/` family.
 */

export const createNewClient = (client) => ({
	type: 'nkn/CREATE_NEW_CLIENT',
	payload: {
		client,
	},
});

export const setBalance = (address, balance) => ({
	type: 'nkn/SET_BALANCE',
	payload: {
		balance: balance.toFixed(8),
		address,
	}
});

export const deactivateClients = () => ({
	type: 'nkn/DEACTIVATE_CLIENTS',
});

export const activateClient = (client) => ({
	type: 'nkn/ACTIVATE_CLIENT',
	payload: {
		client,
	},
});

export const newTransaction = ({
	content,
	recipient,
	targetID,
	topic,
	value,
	...rest
}) => ({
	type: 'nkn/NEW_TRANSACTION_ALIAS',
	payload: {
		content,
		recipient,
		targetID,
		topic,
		value: value * 10 ** -8,
		...rest,
	},
});

export const getBalance = address => ({
	type: 'nkn/GET_BALANCE_ALIAS',
	payload: {
		address,
	},
});
