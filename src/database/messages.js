import db, { maxKey, minKey } from 'Approot/database/db';

export const PAGE_SIZE = 25;

/**
 * Loads message history for topic.
 */
export function loadMessagesFromDb({
	topic,
	previous = {},
	extra = 0,
}) {
	const createdAt = previous.createdAt || maxKey;

	return db.messages
		.where('[topic+createdAt]')
		.between([topic, minKey], [topic, createdAt], false, false)
		.reverse()
		.limit(PAGE_SIZE + extra)
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
			.catch(e => console.error('D-CHAT: HUGE RED FLAG, DB STORAGE', e));
	}
}

function storeToMessagesDb(message) {
	return db.messages.put(message)
		.catch(e => console.error('D-CHAT: HUGE RED FLAG, DB STORAGE', e));
}
