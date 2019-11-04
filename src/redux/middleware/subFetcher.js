import {
	getSubscribers
} from '../actions';

/**
 * Fetches subscribers whenever someone joins the channel.
 *
 * Joining the channel is marked by the 'Joined channel.' message,
 * which has contentType 'dchat/subscribe'.
 * Fetching the sub when it is announced makes seeing new users as subscribed faster,
 * meaning no grey nickname.
 */
const subscribersFetcher = store => next => action => {
	const message = action.payload?.message;
	const type = action.type;
	if (type === 'chat/RECEIVE_MESSAGE') {
		if (message.contentType === 'dchat/subscribe' && message.topic) {
			store.dispatch(getSubscribers(
				message.topic
			));
		}
	}
	return next(action);
};

export default subscribersFetcher;
