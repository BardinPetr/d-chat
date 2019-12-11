import db from 'Approot/database/db';
import { getChangesEmitter } from 'Approot/database/messages';

export function loadReactionsFromDb({ topic, targetID }) {
	return db.reactions
		.where({ topic, targetID })
		.toArray();
}

/**
 * Emits events for new reactions. To subscribe, use -
 * ```
 * const events = getChangesEmitter()
 * const unsub = evens.on( `${topic}-${targetID}`, callback(reaction, isModification) );
 * ```
 */
export function subscribeToReactions({ topic, targetID }, callback) {
	const emitter = getChangesEmitter();
	const event = `${topic}-${targetID}`;

	emitter.on(event, callback);

	return () => emitter.removeListener(event, callback);
}
