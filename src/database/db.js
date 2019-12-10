import Dexie from 'dexie';
import 'dexie-observable';

const db = new Dexie( 'dchat' );
db.version( 1 ).stores({
	attachments: '++id,&hash',
});

db.version( 2 ).stores({
	attachments: '++id, &hash',
	// Primary key [topic+id] so they can be easily updated with `.put`.
	// createdAt was for sorting or something, I suppose?
	messages: '[topic+id+addr], [topic+createdAt], createdAt',
	// reactions: '++_id, [topic+message_id], reaction_id'
	reactions: '++_id, [topic+targetID]',
});

// Observable has some issue and first change (this here) isn't reported.
db.attachments.put({ fixing: 'observable bug' })
	.then( item => db.attachments.delete( item ));

export const maxKey = Dexie.maxKey;
export const minKey = Dexie.minKey;

export default db;
