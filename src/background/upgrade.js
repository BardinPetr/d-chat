import db from 'Approot/database/db';

// 5.0.0: indexeddb
export default async function upgrade(configs) {
	await storeMessagesToDb(configs.messages);
	await storeReactionsToDb(configs.reactions);
}

async function storeMessagesToDb(allMessages) {
	const now = Date.now();
	// Add messages that haven't already been added into the db.
	const messages = Object.values(allMessages).flat().filter(msg => !msg.addedToDatabase);
	messages.forEach((msg, index) => {
		// Primary key compound indexes are broken in Firefox,
		// we will keep track with a timestamp.
		msg.createdAt = now + index;
	});

	if (messages.length) {
		return db.messages
			.bulkAdd(messages);
	}
}

async function storeReactionsToDb(allReactions) {
	const now = Date.now();
	const reactions = Object.values(allReactions).flatMap(
		reactionsForTopic => Object.values(reactionsForTopic)
	).flat();

	reactions.forEach((r, i) => r.createdAt = now + i);

	if (reactions.length) {
		return db.reactions.bulkAdd(reactions);
	}
}
