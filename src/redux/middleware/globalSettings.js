/**
 * Sets flags on messages, depending on global settings. The flags are used in databaser middleware.
 */

const globalSettings = store => next => action => {
	let ignoredUsers;

	switch (action.type) {
		case 'chat/RECEIVE_MESSAGE':
		case 'chat/RECEIVE_REACTION':
			ignoredUsers = store.getState().globalSettings.muted;
			if (ignoredUsers.includes(action.payload.message.addr)) {
				action.payload.message.ignored = true;
			}
			break;
	}
	next(action);
};

export default globalSettings;
