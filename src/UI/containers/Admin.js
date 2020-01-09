import React from 'react';
import { connect } from 'react-redux';
import { acceptPermission, removePermission } from 'Approot/redux/actions';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { IoMdCheckmarkCircleOutline, IoMdCheckmarkCircle } from 'react-icons/io';

const Admin = ({ accept, remove, isApproved }) => (
	<div className="x-admin">
		<a
			className="button"
			onClick={isApproved ? remove : accept}
			title={isApproved ? __('Remove from group.') : __('Allow this person to join.')}
		>
			<span className="icon">
				{isApproved ? (
					<IoMdCheckmarkCircle />
				) : (
					<IoMdCheckmarkCircleOutline />
				)}
			</span>
		</a>
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
