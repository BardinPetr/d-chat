import shasum from 'shasum';
import db from 'Approot/database/db';
import base64ToBlob from 'b64-to-blob';
import base64Mime from 'base64mime';

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export async function storeContact(contact) {
	if (!contact.addr) {
		return;
	}
	const { addr, content, ...rest } = contact;
	const { avatar, ...restOfContent } = (content || {});

	if (avatar?.type === 'base64') {
		if (avatar.data && typeof avatar.data === 'string') {
			let data = avatar.data;
			const mime = base64Mime(data);
			data = data.slice(data.indexOf(',') + 1);
			data = base64ToBlob(data, mime);
			avatar.data = data;
			avatar.type = 'blob';
		} else {
			avatar.data = null;
			avatar.type = null;
		}
	}

	const data = {
		...rest,
		addr,
		content: {
			...restOfContent,
			avatar,
		},
		version: contact.version || shasum(content || Math.random().toString()),
		expiresAt: Date.now() + ONE_WEEK,
	};
	return db.contacts.put(data);
}

export async function getContact(addr) {
	if (!addr) {
		return;
	}
	return db.contacts.get(addr).catch(e => console.error('D-CHAT: getContact error:', e));
}

export async function getContactForSend(addr) {
	const contact = await getContact(addr) || {};

	const avatar = await _blobToBase64(contact?.content?.avatar?.data) || '';

	return {
		...contact,
		content: {
			...contact.content,
			avatar: {
				type: 'base64',
				data: avatar,
			},
		}
	};
}

// Avatars are stored in blob format in idb. Turn them back before sending.
// Storing them as base64 causes UI flashing, because it takes longer to load base64 strings.
// But I wonder if this is too much? Chrome has terrible FileReader.
function _blobToBase64 (blob) {
	if (!blob) {
		return '';
	}
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			resolve(reader.result);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}
