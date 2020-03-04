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

export async function getMessageFromDb(message) {
	return db.messages.get(getMessagePK(message));
}

/**
 * Adds a message or reaction to relevant db table.
 */
export async function storeMessageToDb(message) {
	if (message.contentType === 'reaction') {
		return storeToReactionDb(message);
	} else {
		return _storeMessage(message);
	}
}

export async function modifyMessageInDb(message, mods) {
	const existing = await getMessageFromDb(message);
	if (existing) {
		message = {
			...existing,
			...mods
		};
		return db.messages.put(message).then(() => message)
			.catch(e => console.error('D-CHAT: HUGE RED FLAG, DB STORAGE', e));
	}
}

function storeToReactionDb(message) {
	return db.reactions.put(message)
		.catch(e => console.error('D-CHAT: HUGE RED FLAG, DB STORAGE', e));
}

/**
 * Adding key to database: let's first make sure a createdAt isn't -
 * being changed, because otherwise chat history will go wrong.
 */
async function _storeMessage(message) {
	const existing = await getMessageFromDb(message);
	if (existing) {
		message.createdAt = existing.createdAt;
	}
	return db.messages.put(message).then(() => message)
		.catch(e => console.error('D-CHAT: HUGE RED FLAG, DB STORAGE', e));
}

function getMessagePK(message) {
	return {
		topic: message.topic,
		id: message.id,
		addr: message.addr,
	};
}
