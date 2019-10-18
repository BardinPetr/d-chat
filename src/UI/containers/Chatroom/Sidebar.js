import React from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import { connect } from 'react-redux';
import SubscriberList from 'Approot/UI/components/SubscriberList';
import Profile from 'Approot/UI/components/Profile';

const Sidebar = ({ subscribers }) => (
	<SimpleBar className="dashboard-panel is-medium is-scrollable is-hidden-touch">
		{( Array.isArray(subscribers) ?
			(<SubscriberList subscribers={subscribers} />)
			:
			(<Profile profile={subscribers} />)
		)}
	</SimpleBar>
);

const mapStateToProps = (state, ownProps) => {
	const topic = ownProps.match.params?.topic;
	return ({
		subscribers: state.chatSettings[topic]?.subscribers || topic,
	});
};

export default connect(mapStateToProps)(Sidebar);
