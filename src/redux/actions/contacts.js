/**
 * Actions for contact profiles.
 * Prefix actions with 'contacts/', so the middleware picks them up.
 */

/**
 * Receive contact request. myAddr is passed because it's a pain otherwise.
 */
export const receiveContactRequest = (myAddr, contact) => ({
	type: 'contacts/RECEIVE_CONTACT_REQUEST',
	payload: {
		addr: myAddr,
		contact,
	},
});

// contact should have addr field.
export const updateContact = contact => ({
	type: 'contacts/UPDATE_CONTACT',
	payload: {
		contact,
	},
});

export const requestContact = (addr, requestType = 'full') => ({
	type: 'contacts/REQUEST_CONTACT',
	payload: {
		addr,
		requestType,
	},
});

export const sendContactInfo = (addr, contact) => ({
	type: 'contacts/SEND_CONTACT_INFO',
	payload: {
		contact,
		addr,
	},
});
