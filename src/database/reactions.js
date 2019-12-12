import db from 'Approot/database/db';

export function loadReactionsFromDb({ topic, targetID }) {
	return db.reactions
		.where({ topic, targetID })
		.toArray();
}
