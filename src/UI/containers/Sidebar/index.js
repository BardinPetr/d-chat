import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { __, getChatURL } from 'Approot/misc/util';
import history from 'Approot/UI/history';
import TopicsList from 'Approot/UI/containers/TopicsList';

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
		<p className="menu-label is-hidden-touch">{__('General')}</p>
		<ul className="menu-list">
			<li>
				<Link to="/">{__('Home')}</Link>
			</li>
		</ul>

		<p className="menu-label is-hidden-touch">{__('Channels')}</p>
		<TopicsList />

		<label className="menu-label is-hidden-touch">
			{__('Add a channel')}
		</label>
		<NewTopicForm />
	</aside>
);

export default Sidebar;
