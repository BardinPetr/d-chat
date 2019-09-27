import React, { useState } from 'react';
import { connect } from 'react-redux';
import ClientInfo from 'Approot/UI/components/Client/Info';
import Info from 'Approot/UI/components/Info';
import {
	getChatURL,
	getWhisperURL,
} from 'Approot/misc/util';
import { __ } from 'Approot/misc/browser-util';
import { runtime } from 'webextension-polyfill';
import history from 'Approot/UI/history';

const NewTopicForm = ({ privateChat }) => {
	const [target, setTarget] = useState('');
	const submit = () => {
		let t = privateChat ? getWhisperURL(target) : getChatURL(target);
		history.push(t);
		setTarget('');
	};

	return (
		<form className="field" onSubmit={submit}>
			<div className="control">
				<input placeholder={privateChat ? __('Identity') : __('Topic')} value={target} className="input is-small is-rounded" onChange={e => setTarget(e.target.value)} />
			</div>
		</form>
	);
};


const Home = ({ client }) => (
	<div className="container">

		{client && <ClientInfo className="notification" client={client}>
			<div className="field">
				<p className="is-size-7">{__('D-Chat version')}</p>
				<p>{runtime.getManifest().version}</p>
			</div>
		</ClientInfo>}

		<div className="section" style={{paddingTop: 0}}>
			<div className="field">
				<label className="label has-text-weight-normal">
					{__('Join a chatroom')}:
				</label>
				<div className="control">
					<NewTopicForm />
				</div>
			</div>
			<div className="field">
				<label className="label has-text-weight-normal">
					{__('Private message')}:
				</label>
				<div className="control">
					<NewTopicForm privateChat />
				</div>
			</div>
			<Info />
		</div>
	</div>
);

const mapStateToProps = state => ({
	client: state.clients.find(i => i.active),
});

export default connect(mapStateToProps)(Home);