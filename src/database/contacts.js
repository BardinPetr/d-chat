import db from 'Approot/database/db';

export async function storeContact(contact) {
	if (!contact.addr) {
		return;
	}
	const data = {
		addr: contact.addr,
		data: contact
	};
	return db.contacts.put(data);
}

export async function getContact(addr) {
	return db.contacts.get(addr).catch(e => console.error('D-CHAT: getContact error:', e));
}
