import configs from 'Approot/misc/configs-APP_TARGET';

function deactivate(clients) {
	return clients.map(i => ({ ...i, active: false }));
}

const clients = (state = [], action) => {
	let newState, newClient, address, target;
	switch (action.type) {
		case 'nkn/DEACTIVATE_CLIENTS':
			newState = deactivate(state);
			break;

		case 'nkn/ACTIVATE_CLIENT':
			address = action.payload.client.wallet.Address;
			newState = deactivate(state);
			target = newState.findIndex(client => client.wallet.Address === address);
			if (target === -1) {
				newClient = {
					...action.payload.client,
					createdAt: Date.now(),
					active: true,
				};
				newState = [...newState, newClient];
			} else {
				newState[target] = {
					...newState[target],
					...action.payload.client,
					active: true,
				};
			}
			configs.clientsMeta = newState;
			break;

		case 'nkn/SET_BALANCE':
			address = action.payload.address;
			newState = state.map(c => {
				const client = {...c};
				if (client.wallet.Address === address) {
					client.balance = action.payload.balance;
				}
				return client;
			});
			configs.clientsMeta = newState;
			break;

		default:
			newState = state;
	}
	return newState;
};

export default clients;

export function activeClient(clients) {
	return clients.find(c => c.active);
}
