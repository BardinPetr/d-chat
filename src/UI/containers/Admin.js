import React from 'react';
import { connect } from 'react-redux';
import { acceptPermission, removePermission } from 'Approot/redux/actions';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import Switch from 'Approot/UI/components/Switch';

const Admin = ({ accept, remove, isApproved }) => (
	<div className="x-admin">
		<Switch
			className="is-small"
			onChange={isApproved ? remove : accept}
			checked={!!isApproved}
			title={isApproved ? __('Remove from group.') : __('Allow this person to join.')}
		/>
	</div>
);

const mapStateToProps = (state, ownProps) => ({
	isApproved: (state.chatSettings[ownProps.topic]?.subscribers
		|| []).includes(ownProps.addr),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	accept: () => dispatch(acceptPermission(ownProps.addr, ownProps.topic)),
	remove: () => dispatch(removePermission(ownProps.addr, ownProps.topic)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
