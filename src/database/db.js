import Dexie from 'dexie';

const db = new Dexie('dchat');
db.version(1).stores({
	attachments: '++id,&hash',
});

db.version(2).stores({
	attachments: '++id, &hash',
	// Primary key [topic+id] so they can be easily updated with `.put`.
	// createdAt used for sorting.
	messages: '[topic+id+addr], [topic+createdAt], createdAt',
	// reactions: '++_id, [topic+message_id], reaction_id'
	reactions: '[topic+id+addr], [topic+targetID]',
});

export const maxKey = Dexie.maxKey;
export const minKey = Dexie.minKey;

export default db;
