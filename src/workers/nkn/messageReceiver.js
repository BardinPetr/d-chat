import { storeMessageToDb } from 'Approot/database/messages';
import { receiveMessage } from 'Approot/redux/actions';

export default async function receivingMessage( message ) {
	if ( !message.unreceivable ) {
		storeMessageToDb( message );
		postMessage( receiveMessage( message ));
	}
}
