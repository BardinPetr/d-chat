/**
 * Makes the messages appear to transition in.
 *
 * The private message check-tickers are handled in -
 * notifier.js middleware by mistake.
 */
import { modifyMessage } from 'Approot/redux/actions';

const confirmer = store => next => action => {
	const message = {...action.payload?.message};
	const topic = action.payload?.topic;
	if (message?.isMe) {
		message.isNotConfirmed = false;
		store.dispatch(modifyMessage(topic, message.id, message));
	}
	next(action);
};

export default confirmer;
