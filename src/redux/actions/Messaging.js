import { extension } from 'webextension-polyfill';
import {
	createTransaction,
	markUnread,
	receiveMessage,
} from 'Approot/redux/actions';

/**
 * Deals with incoming messages.
 */
export const handleMessage = (message, dispatch) => {
	if (message.contentType === 'nkn/tip') {
		// Resub to chat (noob friendly tipping).
		dispatch(
			createTransaction(message.transactionID, message)
		);
	}

	// Create notification?
	if ( !message.isMe ) {
		let views = extension.getViews({
			type: 'popup'
		});
		// Notify unless chat is open.
		if ( views.length === 0 ) {
			message.notify();

			// TODO Make this one work for all types of views.
			dispatch( markUnread(message.topic, [message.id]) );
		}
	}

	return dispatch(receiveMessage(message));
};
