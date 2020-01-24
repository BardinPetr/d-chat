import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { acceptPermission, removePermission } from 'Approot/redux/actions';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
// Bugs out gitlab ci, and I don't want to deal with that now.
import { isTopicAdmin } from 'nkn-permissioned-pubsub/util';
import Switch from 'Approot/UI/components/Switch';

// const slicePk = addr => addr.slice(addr.lastIndexOf('.') + 1);
// const isTopicAdmin = (addr1, addr2) => slicePk(addr1) === slicePk(addr2);

const Admin = ({ accept, amAdmin, remove, isApproved }) => (
	<div className={classnames('x-toolbar-admin', {
		'has-text-grey': !amAdmin,
	})}>
		<span>{__('Accept to chat')}</span>
		<Switch
			className="is-small"
			onChange={isApproved ? remove : accept}
			checked={!!isApproved}
			disabled={!amAdmin}
			title={amAdmin ? '' : __('You are not the channel admin')}
		/>
	</div>
);

const mapStateToProps = (state, ownProps) => ({
	isApproved: (state.chatSettings[ownProps.topic]?.subscribers
		|| []).includes(ownProps.addr),
	amAdmin: isTopicAdmin(ownProps.topic, state.clients.find(c => c.active).addr),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	accept: () => dispatch(acceptPermission(ownProps.addr, ownProps.topic)),
	remove: () => dispatch(removePermission(ownProps.addr, ownProps.topic)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
