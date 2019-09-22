import React from 'react';
import { __ } from 'Approot/misc/browser-util';
import { connect } from 'react-redux';
import { subscribeToChat } from 'Approot/redux/actions';

const SubscribeOfferMessage = ({ timestamp, dispatch, topic }) => (
	<React.Fragment>
		<div className="message-header is-paddingless has-text-weight-light">
			<span className="has-text-grey is-size-7 x-is-padding-left">
				{new Date(timestamp).toLocaleString()}
			</span>
		</div>
		<div className="message-body x-is-small-padding">
			<p>{__('No subscription, or about to expire.')}</p>
			<a className="button is-small" onClick={() => dispatch(subscribeToChat(topic))}>
				{__('Subscribe')}
			</a>
		</div>
	</React.Fragment>
);

export default connect()(SubscribeOfferMessage);
