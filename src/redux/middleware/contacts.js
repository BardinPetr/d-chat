/**
 * Handles updating and receiving contact profile information stuff.
 */

import {
	getContact,
	storeContact,
	getContactForSend,
} from 'Approot/database/contacts';
import {
	sendContactInfo,
	requestContact,
} from 'Approot/redux/actions/contacts';

/**
 * Adds and updates contacts. Sends out our contact information, when asked,
 * for now.
 */
const contactsHandler = store => next => async action => {
	const type = action.type;
	if (type?.startsWith('contacts')) {
		const contact = action.payload.contact;
		const requestType = contact.requestType;
		const myAddr = action.payload.addr;
		const senderAddr = contact.addr;
		let version, response, data;

		switch(type) {
			case 'contacts/RECEIVE_CONTACT_REQUEST':
				switch (requestType) {
					case 'header':
						({ version } = await getContact(myAddr) || {});
						// Respond with our version number.
						store.dispatch(sendContactInfo(senderAddr, {
							version,
						}));
						break;

					case 'full':
						response = await getContactForSend(myAddr);
						store.dispatch(sendContactInfo(senderAddr, response));
						break;

					default:
						console.log('D-Chat: Some odd type came up:', action);
						break;
				}
				// Bail.
				return;

			case 'contacts/UPDATE_CONTACT':
				switch (requestType) {
					case 'response/header':
						data = await getContact(contact.addr);
						if (!data || data.version !== contact.version) {
							store.dispatch(requestContact(contact.addr, 'full'));
						} else {
							// Updates expiresAt date, rest of data stays same.
							storeContact(data);
						}
						// Bail.
						return;

					case 'response/full':
						storeContact(action.payload.contact);
						// No bail. These events are tracked in UI.
						break;
				}
				break;
		}

	} else if (type === 'chat/RECEIVE_MESSAGE') {
		const message = action.payload.message;
		shouldUpdateProfile(message.addr).then(yes => yes &&
			store.dispatch(requestContact(message.addr, 'header'))
		);
	}
	return next(action);
};

export default contactsHandler;

// We use a cache so we don't spam people who don't respond with headers.
const profileExpiryCache = {};
async function shouldUpdateProfile(addr) {
	if (profileExpiryCache[addr]) {
		return false;
	}
	profileExpiryCache[addr] = true;

	const { expiresAt } = await getContact(addr) || {};
	if (!expiresAt || expiresAt > Date.now()) {
		return true;
	}
	return false;
}
