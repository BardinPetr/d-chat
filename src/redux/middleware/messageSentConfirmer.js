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
