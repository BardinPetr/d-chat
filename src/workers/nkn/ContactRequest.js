/**
 * https://forum.nkn.org/t/nmobile-message-protocol/2203
 */
import OutgoingMessage from './OutgoingMessage';

export class ContactRequest extends OutgoingMessage {
	constructor(requestType, data = {}) {
		super(data);
		this.contentType = 'contact';

		// Request type is 'header' or 'full'.
		this.requestType = requestType;
		this.content = undefined;
		this.topic = undefined;
	}
}

export class ContactResponse extends OutgoingMessage {
	constructor(data = {}) {
		super(data);
		this.contentType = 'contact';
		this.version = data.version;
		this.expiresAt = undefined;
		this.expires_at = undefined;
	}
}
