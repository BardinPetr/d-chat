import shasum from 'shasum';
import db from 'Approot/database/db';
import base64ToBlob from 'b64-to-blob';
import base64Mime from 'base64mime';

// Turns out IDB can index blobs just fine now, and probably uses hashes.
// https://dexie.org/docs/API-Reference (ctrl+f 'blob')
// Although, not sure what the Firefox note there means.
export function saveAttachment(data) {
	const hash = shasum(data);
	const mime = base64Mime(data);
	data = data.slice(data.indexOf(',') + 1);
	data = base64ToBlob(data, mime);
	db.attachments.add({
		hash,
		data,
	});
	return hash;
}

export async function loadAttachment(hash) {
	return db.attachments.get({
		hash,
	});
}
