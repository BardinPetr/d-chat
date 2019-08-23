import React, { useState } from 'react';
import history from 'Approot/UI/history';
import { __, getChatURL } from 'Approot/misc/util';

const NewTopicForm = () => {
	const [topic, setTopic] = useState('');
	const submit = () => {
		history.push(getChatURL(topic));
		setTopic('');
	};

	return (
		<form className="field" onSubmit={submit}>
			<div className="control">
				<input placeholder={__('Topic')} value={topic} className="input is-small is-rounded" onChange={e => setTopic(e.target.value)} />
			</div>
		</form>
	);
};

export default NewTopicForm;
