import React, { useState } from 'react';
import { connect } from 'react-redux';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import classnames from 'classnames';

// Not the most reusable container.
const SubscriberList = ({ subscribers, className }) => {
	const [open, setOpen] = useState(false);

	return (
		<div className={className}>
			<a
				className="navbar-link"
				onClick={() => setOpen(!open)}
			>
				{subscribers.length} {__('Subscribers')}
			</a>
			<div className={classnames('x-has-max-width x-has-max-height has-background-grey-lighter navbar-dropdown is-clipped is-right', {
				'is-hidden-mobile': !open,
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
