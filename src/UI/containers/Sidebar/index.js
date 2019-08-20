import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { __, getChatURL } from 'Approot/misc/util';
import TopicLink from 'Approot/UI/components/TopicLink';
import history from 'Approot/UI/history';

const mapStateToProps = state => ({
	topics: Object.keys(state.chatSettings || {}),
});

export const TopicsList = connect(
	mapStateToProps
)(({ topics }) => (
	<ul className="menu-list">
		{topics.map((topic, key) => (
			<li key={key}>
				<TopicLink topic={topic} />
			</li>
		))}
	</ul>
));

export const NewTopicForm = () => {
	const [topic, setTopic] = useState('');
	const submit = () => {
		history.push(getChatURL(topic));
		setTopic('');
	};

	return (
		<form className="field" onSubmit={submit}>
			<div className="control">
				<input value={topic} className="input is-small is-rounded" onChange={e => setTopic(e.target.value)} />
			</div>
		</form>
	);
};

const Sidebar = () => (
	<aside className="menu is-narrow-mobile section is-hidden-mobile">
		<p className="menu-label is-hidden-tablet">{__('General')}</p>
		<Link to="/" className="navbar-item">
			{__('Home')}
		</Link>

		<p className="menu-label is-hidden-tablet">{__('Channels')}</p>
		<TopicsList />

		<label className="label menu-label is-hidden-tablet">
			{__('Add a channel')}
		</label>
		<NewTopicForm />
	</aside>
);

export default Sidebar;
