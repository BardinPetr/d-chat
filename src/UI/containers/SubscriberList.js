/**
 * Lists chatters in topic in navbar (header).
 */
import React from 'react';
import { connect } from 'react-redux';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import classnames from 'classnames';

const SubscriberList = ({
	active,
	className,
	onClick,
	subscribers,
}) => {
	return (
		<div className={`x-subs-list ${className}`} onClick={onClick}>
			<a
				className="navbar-link"
			>
				{subscribers.length}<span className="is-hidden-tablet-only">&nbsp;{__('people chatting')}</span>
			</a>
			<div className={classnames('x-has-max-width x-has-max-height navbar-dropdown is-clipped is-right', {
				'is-hidden-mobile': !active,
			})}>
				{subscribers.sort().map(sub => (
					<a
						className={'navbar-item'}
						key={sub}
					>
						<span>{sub}</span>
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
