/**
 * Handles updating and receiving contact profile information stuff.
 */

import {
	getContact,
	storeContact,
} from 'Approot/database/contacts';
import {
	sendContactInfo,
} from 'Approot/redux/actions/contacts';
import { isContact } from 'Approot/misc/util';

/**
 * Adds and updates contacts. Sends out our contact information, when asked,
 * for now.
 */
const contactsHandler = store => next => async action => {
	if (action?.type?.startsWith('contacts')) {
		const type = action.type;
		const message = action.payload?.message;
		if (isContact(message)) {
			const type = message.requestType;
			const { version, content } = await getContact(action.payload.addr);
			switch (type) {
				case 'header':
					// Respond with our version number.
					store.dispatch(sendContactInfo({
						version,
						expires_at: 2 * Date.now(), // What is the point??
						topic: message.addr,
						contentType: 'contact',
					}));
					return;

				case 'full':
					store.dispatch(sendContactInfo({
						version,
						expires_at: 2 * Date.now(), // What is the point??
						content,
						topic: message.addr,
						contentType: 'contact',
					}));
					return;
			}
		} else if (type === 'contacts/UPDATE_CONTACT') {
			return storeContact(action.payload);
		}
		// Never gets here.
	}
	return next(action);
};

export default contactsHandler;
