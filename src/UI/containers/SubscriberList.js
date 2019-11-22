/**
 * Lists chatters in topic in navbar (header).
 */
import React from 'react';
import { connect } from 'react-redux';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import classnames from 'classnames';

// Not the most reusable container.
const SubscriberList = ({ subscribers, className, active, onClick }) => {

	return (
		<div className={className} onClick={onClick}>
			<a
				className="navbar-link"
			>
				{subscribers.length} {__('people chatting')}
			</a>
			<div className={classnames('x-has-max-width x-has-max-height has-background-grey-lighter navbar-dropdown is-clipped is-right', {
				'is-hidden-mobile': !active,
			})}>
				{subscribers.sort().map((sub, key) => (
					<a className="navbar-item" key={key}>
						{sub}
					</a>
				))}
			</div>
		</div>
	);
};

const mapStateToProps = (state, ownProps) => ({
	subscribers: state.chatSettings[ownProps.topic]?.subscribers || [],
});

export default connect(mapStateToProps)(SubscriberList);
