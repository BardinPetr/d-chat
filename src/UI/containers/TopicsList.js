import React from 'react';
import { connect } from 'react-redux';
import TopicLink from 'Approot/UI/components/TopicLink';

const TopicsList = ({ topics }) => (
	<ul className="menu-list">
		{topics.map((topic, key) => (
			<li key={key}>
				<TopicLink topic={topic} />
			</li>
		))}
	</ul>
);

const mapStateToProps = state => ({
	topics: Object.keys(state.chatSettings || {}),
});

export default connect(mapStateToProps)(TopicsList);
