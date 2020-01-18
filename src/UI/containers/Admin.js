import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { acceptPermission, removePermission } from 'Approot/redux/actions';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { isAdmin } from 'nkn-permissioned-pubsub';
// import { isAdmin } from 'Approot/workers/nkn/nkn-permissioned-pubsub';
import Switch from 'Approot/UI/components/Switch';

const Admin = ({ accept, amAdmin, isChannelAdmin, remove, isApproved }) => (
	<div className={classnames('x-toolbar-admin', {
		'has-text-grey': !amAdmin,
	})}>
		<span>{__('Accept to chat')}</span>
		<Switch
			className="is-small"
			onChange={isApproved ? remove : accept}
			checked={!!isApproved}
			disabled={!amAdmin || isChannelAdmin}
			title={amAdmin ? (isChannelAdmin ? __('Cannot remove an admin') : '') : __('You are not the channel admin')}
		/>
	</div>
);

const mapStateToProps = (state, ownProps) => ({
	isApproved: (state.chatSettings[ownProps.topic]?.subscribers
		|| []).includes(ownProps.addr),
	amAdmin: isAdmin(ownProps.topic, state.clients.find(c => c.active).addr),
	isChannelAdmin: isAdmin(ownProps.topic, ownProps.addr),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	accept: () => dispatch(acceptPermission(ownProps.addr, ownProps.topic)),
	remove: () => dispatch(removePermission(ownProps.addr, ownProps.topic)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
