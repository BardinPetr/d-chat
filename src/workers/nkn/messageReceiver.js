import { storeMessageToDb } from 'Approot/database/messages';
import { receiveMessage, modifyMessage } from 'Approot/redux/actions';

let messagesWaitingForConfirmation = [];

export default async function receivingMessage(message) {
	if (!message.unreceivable) {
		let posted = false;

		storeMessageToDb(message);

		if (message.isNotConfirmed) {
			messagesWaitingForConfirmation.push(message.id);
		} else if (messagesWaitingForConfirmation.includes(message.id)) {
			postMessage(modifyMessage(message));
			posted = true;
			// Drop.
			messagesWaitingForConfirmation = messagesWaitingForConfirmation.filter(
				id => id !== message.id
			);
		}

		if (!posted) {
			postMessage(receiveMessage(message));
		}
	}
}
