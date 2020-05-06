/**
 * Actions for contact profiles.
 * Prefix actions with 'contacts/', so the middleware picks them up.
 */
import shasum from 'shasum';

/**
 * Receive contact request.
 */
export const receiveContact = (myAddr, message) => ({
	type: 'contacts/RECEIVE_REQUEST',
	payload: {
		addr: myAddr,
		message,
	},
});

export const updateContact = contact => ({
	type: 'contacts/UPDATE_CONTACT',
	payload: {
		...contact,
		version: shasum(contact),
		addr: contact.addr,
	},
});

export const requestContactHeaders = addr => ({
	type: 'contacts/REQUEST_HEADERS',
	payload: {
		addr,
	},
});

export const requestContactProfile = addr => ({
	type: 'contacts/REQUEST_PROFILE',
	payload: {
		addr,
	},
});

export const sendContactInfo = contact => ({
	type: 'contacts/SEND',
	payload: {
		contact: {
			...contact,
			topic: undefined,
		},
		recipient: contact.topic,
	},
});
