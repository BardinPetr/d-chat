import React from 'react';
import { connect } from 'react-redux';
import { acceptPermission, removePermission } from 'Approot/redux/actions';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { isAdmin } from 'nkn-permissioned-pubsub';
// import { isAdmin } from 'Approot/workers/nkn/nkn-permissioned-pubsub';
import Switch from 'Approot/UI/components/Switch';

const Admin = ({ accept, amAdmin, remove, isApproved }) => (
	<div className="x-toolbar-admin">
		<span>{__('Accept to chat')}</span>
		<Switch
			className="is-small"
			onChange={isApproved ? remove : accept}
			checked={!!isApproved}
			disabled={!amAdmin}
		/>
	</div>
);

const mapStateToProps = (state, ownProps) => ({
	isApproved: (state.chatSettings[ownProps.topic]?.subscribers
		|| []).includes(ownProps.addr),
	amAdmin: isAdmin(ownProps.topic, state.clients.find(c => c.active).addr),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	accept: () => dispatch(acceptPermission(ownProps.addr, ownProps.topic)),
	remove: () => dispatch(removePermission(ownProps.addr, ownProps.topic)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
