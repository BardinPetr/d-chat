import { isDelete } from 'Approot/misc/util';
import { getMessageFromDb } from 'Approot/database/messages';
import storeMessage from 'Approot/redux/receiveMessage';
/**
 * Saves messages to indexedDB.
 */

/**
 * Messages to be ignored, i.e. not sent to next (notifier) middlewares.
 * Delete messages are events, so ignore.
 * Messages that are already in the db are ignored.
 */
const shouldSkip = async message => {
	const existing = await getMessageFromDb(message);
	return (
		existing != null
		|| isDelete(message)
	);
};

const databaser = store => next => async action => {
	let message, skip = false;

	switch (action.type) {
		case 'chat/RECEIVE_MESSAGE':
		case 'chat/RECEIVE_REACTION':
			message = action.payload.message;
			skip = await shouldSkip(message);
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
