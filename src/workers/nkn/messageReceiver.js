import { storeMessageToDb, modifyMesssageInDb } from 'Approot/database/messages';
import { receiveMessage, modifyMessage } from 'Approot/redux/actions';

let messagesWaitingForConfirmation = [];

export default async function receivingMessage(message) {
	if (!message.unreceivable) {

		if (message.modifications) {
			modifyMesssageInDb({
				topic: message.topic,
				id: message.targetID,
				addr: message.addr
			}, {
				isNotConfirmed: message.isNotConfirmed,
				...message.modifications
			}).then(message => message && postMessage(modifyMessage(message)));
			return;
		}

		storeMessageToDb(message);

		if (messagesWaitingForConfirmation.includes(message.id)) {
			postMessage(modifyMessage(message));
			// Drop.
			messagesWaitingForConfirmation = messagesWaitingForConfirmation.filter(
				id => id !== message.id
			);
			return;
		}

		if (message.isNotConfirmed) {
			messagesWaitingForConfirmation.push(message.id);
		}

		postMessage(receiveMessage(message));
	}
}
