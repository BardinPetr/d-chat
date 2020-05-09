/**
 * https://forum.nkn.org/t/nmobile-message-protocol/2203
 */
import OutgoingMessage from './OutgoingMessage';

export class ContactRequest extends OutgoingMessage {
	constructor(requestType, opts = {}) {
		super(opts);
		this.contentType = 'contact';

		// Request type is 'header' or 'full'.
		this.requestType = requestType;
		this.content = undefined;
		this.topic = undefined;
	}
}

export class ContactResponse extends OutgoingMessage {
	constructor(opts = {}) {
		super(opts);
		this.contentType = 'contact';
		this.expiresAt = undefined;
		this.expires_at = undefined;
	}
}
