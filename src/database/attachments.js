import shasum from 'shasum';
import db from 'Approot/database/db';
import base64ToBlob from 'b64-to-blob';
import base64Mime from 'base64mime';

export function saveAttachment(data) {
	const hash = shasum(data);
	const mime = base64Mime(data);
	data = data.slice(data.indexOf(',') + 1);
	data = base64ToBlob(data, mime);
	db.attachments.add({
		hash,
		data,
	}).catch(() => {});
	return hash;
}

export async function loadAttachment(hash) {
	return db.attachments.get({
		hash,
	});
}
