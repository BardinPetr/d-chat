import { isDelete } from 'Approot/misc/util';
import { getMessageFromDb } from 'Approot/database/messages';
import { storeContact } from 'Approot/database/contacts';
import receiveMessage from 'Approot/redux/receiveMessage';
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
			await receiveMessage(message).then(actions => actions.forEach(
				a => store.dispatch(a)
			));
			break;

		case 'contact/RECEIVE_REQUEST':
			storeContact(action.payload);
			break;
	}

	if (!skip) {
		next(action);
	}
};

export default databaser;
