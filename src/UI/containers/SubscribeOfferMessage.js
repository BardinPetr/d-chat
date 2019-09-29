import React from 'react';
import { __ } from 'Approot/misc/browser-util';
import { connect } from 'react-redux';
import { subscribeToChat, removeMessageById } from 'Approot/redux/actions';
import { ONE_SATOSHI } from 'Approot/misc/util';
import TimeAgo from 'Approot/UI/components/Chatroom/TimeAgo';

const SubscribeOfferMessage = ({ content, timestamp, dispatch, topic, id }) => (
	<React.Fragment>
		<div className="has-text-weight-light">
			<span className="has-text-grey is-size-7 x-is-padding-left">
				<TimeAgo date={timestamp} />
			</span>
			<a className="is-pulled-right delete" onClick={() => dispatch(removeMessageById(topic, id))} />
		</div>
		<div className="">
			{!content && <p>{__('No subscription, or about to expire.')}</p>}
			{/* This is generated locally, as well as sanitized. */}
			{content && <div dangerouslySetInnerHTML={{__html: content}}></div>}
			<div className="field is-grouped">
				<div className="control">
					<a className="button is-small" onClick={() => {
						dispatch(subscribeToChat(topic));
						dispatch(removeMessageById(topic, id));
					}}>
						{__('Subscribe')}
					</a>
				</div>
				<div className="control">
					<a className="button is-small" onClick={() => {
						dispatch(subscribeToChat(topic, { fee: ONE_SATOSHI }));
						dispatch(removeMessageById(topic, id));
					}}>
						{__('Subscribe with fee')}
					</a>
				</div>
			</div>
			{!content && <p>{__('If your free subscription never resolves, then use a fee.')}</p>}
		</div>
	</React.Fragment>
);

export default connect()(SubscribeOfferMessage);
