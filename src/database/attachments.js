import Dexie from 'dexie';
import base64ToBlob from 'b64-to-blob';
import base64Mime from 'base64mime';

const db = new Dexie('dchat');
db.version(1).stores({
	attachments: '++id,&hash',
});

export function saveAttachment({data, hash}) {
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
