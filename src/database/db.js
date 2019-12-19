import Dexie from 'dexie';

const db = new Dexie('dchat');
db.version(1).stores({
	attachments: '++id,&hash',
});

db.version(2).stores({
	attachments: '++id, &hash',
	// Primary key [topic+id+addr] so they can be easily updated with `.put` -
	// and only message owner can update their message.
	// createdAt used for sorting.
	// [topic+createdAt] used for loading more history.
	messages: '[topic+id+addr], [topic+createdAt], createdAt',
	reactions: '[topic+id+addr], [topic+targetID]',
});

export const maxKey = Dexie.maxKey;
export const minKey = Dexie.minKey;

export default db;
