import db from 'Approot/database/db';
import base64ToBlob from 'b64-to-blob';
import base64Mime from 'base64mime';

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export async function storeContact(contact) {
	if (!contact.addr) {
		return;
	}
	const { addr, version, avatar, ...rest } = contact;
	if (avatar?.type === 'base64' && typeof avatar.data === 'string') {
		let data = avatar.data;
		const mime = base64Mime(data);
		data = data.slice(data.indexOf(',') + 1);
		data = base64ToBlob(data, mime);
		avatar.data = data;
		avatar.type = 'blob';
	}
	const data = {
		addr,
		content: {
			...rest,
			avatar,
		},
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
