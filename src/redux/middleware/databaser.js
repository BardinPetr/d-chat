import { isDelete } from 'Approot/misc/util';
import storeMessage from 'Approot/redux/receiveMessage';
/**
 * Saves messages to indexedDB.
 */

/**
 * Messages to be ignored.
 * Delete messages are events, so ignore.
 */
const shouldSkip = message =>
	isDelete(message);

const databaser = store => next => action => {
	let message, skip = false;

	switch (action.type) {
		case 'chat/RECEIVE_MESSAGE':
		case 'chat/RECEIVE_REACTION':
			message = action.payload.message;
			if (shouldSkip(message)) {
				skip = true;
			}
			// Maybe don't store messages that are ignored? Something to think about.
			storeMessage(message).then(actions => actions.forEach(
				a => store.dispatch(a)
			));
			break;
	}

	if (!skip) {
		next(action);
	}
};

export default databaser;
