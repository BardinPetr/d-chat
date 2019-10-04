import React from 'react';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { connect } from 'react-redux';
import { subscribeToChat, removeMessageById } from 'Approot/redux/actions';
import { ONE_SATOSHI } from 'Approot/misc/util';

const Del = ({ id, topic, dispatch }) => (
	<a
		className="is-pulled-right delete"
		onClick={() => dispatch(removeMessageById(topic, id))}
	/>
);
export const DeleteMessageButton = connect()(Del);

const SubscribeOfferMessage = ({ id, content, dispatch, topic }) => (
	<div className="message-body x-is-small-padding">
		{!content && <p>{__('No subscription, or about to expire. You MUST be subscribed in order receive messages. Subscribing is free.')}</p>}
		{/* This is generated locally, as well as sanitized. */}
		{content && <div dangerouslySetInnerHTML={{ __html: content }}></div>}
		<div className="field is-grouped">
			<div className="control">
				<a
					className="button is-small"
					onClick={() => {
						dispatch(subscribeToChat(topic));
						dispatch(removeMessageById(topic, id));
					}}
				>
					{__('Subscribe')}
				</a>
			</div>
			<div className="control">
				<a
					className="button is-small"
					onClick={() => {
						dispatch(subscribeToChat(topic, { fee: ONE_SATOSHI }));
						dispatch(removeMessageById(topic, id));
					}}
				>
					{__('Subscribe with 1sat fee')}
				</a>
			</div>
		</div>
	</div>
);

export default connect()(SubscribeOfferMessage);
