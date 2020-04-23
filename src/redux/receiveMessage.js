import { storeMessageToDb, modifyMessageInDb } from 'Approot/database/messages';
import { modifyMessage } from 'Approot/redux/actions';

let messagesWaitingForConfirmation = [];

/**
 * Stores message, returns array of actions to dispatch.
 * Also stores attachments.
 */
export default async function receivingMessage(message) {
	if (!message.unreceivable) {

		if (message.modifications) {

			// For msg deletions, removes content and unlinks attachments -
			// if message is confirmed.
			if (!message.isNotConfirmed) {
				message.modifications = {
					...message.modifications,
					...message.modifications._onConfirm
				};
			}
			delete message.modifications._onConfirm;

			return modifyMessageInDb({
				topic: message.topic,
				id: message.targetID,
				addr: message.addr
			}, {
				isNotConfirmed: message.isNotConfirmed,
				...message.modifications
			}).then(message => message && [modifyMessage(message)]);
		}

		storeMessageToDb(message);

		if (messagesWaitingForConfirmation.includes(message.id)) {
			// Drop.
			messagesWaitingForConfirmation = messagesWaitingForConfirmation.filter(
				id => id !== message.id
			);
			return [modifyMessage(message)];
		}

		if (message.isNotConfirmed) {
			messagesWaitingForConfirmation.push(message.id);
		}
	}
	return [];
}
