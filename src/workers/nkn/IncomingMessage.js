import sanitize from 'sanitize-html';
import marked from 'marked';
import Message from './Message';
// import { genPrivateChatName } from 'Approot/misc/util';
// import { markUnread } from 'Approot/redux/actions';

class IncomingMessage extends Message {
	constructor(message) {
		super(message);
		this.messageClass = 'IncomingMessage';

		// Sanitize data when message arrives.
		this.content = sanitize(marked(message.content || '')).trim();

		// switch (this.contentType) {
		// 	case 'nkn/tip':
		// 	case 'reaction':
		// 		// Omit notifications for reactions.
		// 		this.isSeen = true;
		// 		break;

		// 	case 'dchat/subscribe':
		// 		if ( !this.addr ) {
		// 			this.isMe = true;
		// 		}
		// 		break;
		// }

		// Should be handled with a middleware?
		// if ( !this.isMe && !this.isSeen ) {
		// 	postMessage( markUnread(this.topic, [this.id]) );
		// }
	}
}

export default IncomingMessage;
