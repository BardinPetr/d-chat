import Dexie from 'dexie';

// TODO this should be `new Dexie('dchat' + nkn.addr)` and probably encrypted.
// Possibly move some of the stuff from extension local.storage into indexedDB.
const db = new Dexie('dchat');
db.version(1).stores({
	attachments: '++id,&hash',
});

db.version(2).stores({
	// Primary key [topic+id+addr] so they can be easily updated with `.put` -
	// and only message owner can update their message.
	// createdAt used for sorting.
	// [topic+createdAt] used for loading more history.
	messages: '[topic+id+addr], [topic+createdAt], createdAt',
	reactions: '[topic+id+addr], [topic+targetID]',
});

db.version(3).stores({
	// Avatars, nicknames, etc. `data` field is not indexed, so not listed here.
	contacts: 'addr',
});

export const maxKey = Dexie.maxKey;
export const minKey = Dexie.minKey;

export default db;
