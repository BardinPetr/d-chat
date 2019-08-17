import React, { useState } from 'react';
import { connect } from 'react-redux';
import ReactSidebar from 'react-sidebar';
import TopicLink from '../components/TopicLink';

const Sidebar = () => {
	const [ open, setOpen ] = useState(false);

	return (
		<ReactSidebar
			open={open}
			onSetOpen={open => setOpen(open)}
		>
			<TopicLink topic="xxxxx" />
		</ReactSidebar>
	);
};

const mapStateToProps = state => ({
	open: state.ui.sidebar.open,

});

export default connect()(Sidebar);
