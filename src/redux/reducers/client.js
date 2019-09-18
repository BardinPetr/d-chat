import configs from 'Approot/misc/configs';

const clients = (state = configs.clientsMeta, action) => {
	let newState, initial, address;
	switch (action.type) {
		case 'nkn/SWITCHED_TO_CLIENT':
			address = action.payload.address;
			newState = state.map(c => {
				let client = {...c};
				const isTarget = (client.wallet.Address === address);
				client.active = isTarget;
				if (isTarget) {
					client = {
						...client,
						...action.payload.client,
						active: true,
					};
				}
				return client;
			});
			configs.clientsMeta = newState;
			break;

		case 'nkn/CREATE_NEW_CLIENT':
			initial = {
				...action.payload.client,
				createdAt: Date.now(),
				active: true,
			};
			newState = state.map(i => ({ ...i, active: false }));
			newState = [...newState, initial];
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
