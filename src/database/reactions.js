import db from 'Approot/database/db';
import { getChangesEmitter } from 'Approot/database/messages';

export function loadReactionsFromDb({ topic, targetID }) {
	return db.reactions
		.where({ topic, targetID })
		.toArray();
}

export function subscribeToReactions({ topic, targetID }, callback) {
	const emitter = getChangesEmitter();
	const event = `${topic}-${targetID}`;

	emitter.on(event, callback);

	return () => emitter.removeListener(event, callback);
}
