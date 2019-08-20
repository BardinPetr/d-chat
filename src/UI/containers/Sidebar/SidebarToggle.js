import React from 'react';
import { connect } from 'react-redux';
import { toggleSidebar } from 'Approot/redux/actions';

// TODO has bug with docked state. isdocked && open popup -> undocked forever
// Create separate redux store for UI?
const SidebarToggle = ({ toggleSidebar, docked }) => (
	<div className="sidebar-toggle-button">
		{ !docked && (
			<button type="button" onClick={toggleSidebar}>
				=
			</button>
		)}
	</div>
);

const mapStateToProps = state => ({
	docked: state.sidebar.docked,
});

const mapDispatchToProps = dispatch => ({
	toggleSidebar: () => dispatch(toggleSidebar()),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SidebarToggle);
