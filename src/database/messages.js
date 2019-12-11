import db, { maxKey, minKey } from 'Approot/database/db';
import EventEmitter from 'events';

export const PAGE_SIZE = 25;

const messageEvents = new EventEmitter();
let hasSubscription = false;

/**
 * Messages:
 * subscribeToMessageChanges(topic, cb)
 * Reactions:
 * subscribeToReactions({topic, targetID}, cb)
 */
export function getChangesEmitter() {
	if (!hasSubscription) {
		db.on('changes', changesListener);
		hasSubscription = true;
	}
	return messageEvents;
}

/**
 * Emits events for new messages. To subscribe, use -
 * ```
 * const events = getChangesEmitter()
 * const unsub = evens.on( 'topicname', callback(message, isModification) );
 * ```
 */
function changesListener(changes) {
	changes.forEach(change => {
		if (! ['messages', 'reactions'].includes(change.table)) {
			return;
		}
		const msg = change.obj;
		if (!msg?.topic) {
			return;
		}
		if (msg.contentType === 'reaction') {
			messageEvents.emit(`${msg.topic}-${msg.targetID}`, msg, change.mods);
		} else {
			messageEvents.emit(msg.topic, msg, change.mods);
		}
	});
}

export function subscribeToMessageChanges(topic, callback) {
	const messageEvents = getChangesEmitter();

	messageEvents.on(topic, callback);

	return () => messageEvents.removeListener(topic, callback);
}

/**
 * Loads message history for topic.
 */
export function loadMessagesFromDb({
	topic,
	previous = {}
}) {
	const createdAt = previous.createdAt || maxKey;

	return db.messages
		.where('[topic+createdAt]')
		.between([topic, minKey], [topic, createdAt], false, false)
		.reverse()
		.limit(PAGE_SIZE)
		.sortBy('createdAt')
		// Kinda crazy how we unreverse it like this.
		.then(arr => arr.reverse());
}

export async function storeMessageToDb(message) {
	if (message.contentType === 'reaction') {
		return storeToReactionDb(message);
	} else {
		return storeToMessagesDb(message);
	}
}

function storeToReactionDb(message) {
	if (message.contentType === 'reaction') {
		return db.reactions.put(message)
			.catch(e => console.error('HUGE RED FLAG DB STORAGE', e));
	}
}

function storeToMessagesDb(message) {
	return db.messages.put(message)
		.catch(e => console.error('HUGE RED FLAG DB STORAGE', e));
}
