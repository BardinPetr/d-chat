import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import ClientInfo from 'Approot/UI/components/Client/Info';
import Info from 'Approot/UI/components/Info-APP_TARGET';
import { getChatURL, getWhisperURL } from 'Approot/misc/util';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import history from 'Approot/UI/history';
import Version from 'Approot/UI/components/Version';

const NewTopicForm = ({ privateChat }) => {
	const [target, setTarget] = useState('');
	const submit = e => {
		e.preventDefault();
		let t = privateChat ? getWhisperURL(target) : getChatURL(target);
		history.push(t);
		setTarget('');
	};

	return (
		<form className="field" onSubmit={submit}>
			<div className="control">
				<span className="is-sr-only">{__('No slashes')}</span>
				<input
					placeholder={privateChat ? __('Contact address') : __('Topic')}
					value={target}
					type="text"
					className="input is-small"
					onChange={e => setTarget(e.target.value)}
					pattern="[^\/]*"
				/>
			</div>
		</form>
	);
};

const Home = ({ client }) => (
	<section className="section">
		<div className="container">
			<div className="columns">
				<div className="column">
					<div className="container">
						<div className="notification">
							<div className="field">
								<p className="is-size-7 has-text-grey-darker">
									{__('Contact address')}
								</p>
								<p className="x-address-broken x-address">{client.addr}</p>
							</div>
						</div>
					</div>
					<div className="field">
						<label className="label has-text-weight-normal">
							{__('Join a chatroom')}
						</label>
						<div className="control">
							<NewTopicForm />
						</div>
					</div>
					<div className="field">
						<label className="label has-text-weight-normal">
							{__('Private message')}
						</label>
						<div className="control">
							<NewTopicForm privateChat />
						</div>
					</div>
					<div className="content">
						<p className="has-text-italic">{__('Chat names should not contain slashes.')}</p>
						<p><Link to="/topics">{__('Public chat index')}</Link></p>
						<Info />
					</div>

					<div className="container">
						{client && (
							<ClientInfo client={client}>
								<Version />
							</ClientInfo>
						)}
					</div>

				</div>
			</div>
		</div>
	</section>
);

const mapStateToProps = state => ({
	client: state.clients.find(i => i.active),
});

export default connect(mapStateToProps)(Home);
