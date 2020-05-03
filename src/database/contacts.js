import db from 'Approot/database/db';

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export async function storeContact(contact) {
	if (!contact.addr) {
		return;
	}
	const { addr, version, ...rest } = contact;
	const data = {
		addr,
		content: rest,
		version,
		expires_at: Date.now() + ONE_WEEK,
	};
	return db.contacts.put(data);
}

export async function getContact(addr) {
	if (!addr) {
		return;
	}
	return db.contacts.get(addr).catch(e => console.error('D-CHAT: getContact error:', e));
}
