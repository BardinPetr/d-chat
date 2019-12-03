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
				<input
					placeholder={privateChat ? __('Contact address') : __('Topic')}
					value={target}
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
					<div className="columns">
						<div className="column">
							<div className="field">
								<label className="label has-text-weight-normal">
									{__('Join a chatroom')}
								</label>
								<div className="control">
									<NewTopicForm />
								</div>
							</div>
						</div>
						<div className="column">
							<div className="field">
								<label className="label has-text-weight-normal">
									{__('Private message')}
								</label>
								<div className="control">
									<NewTopicForm privateChat />
								</div>
							</div>
						</div>
						<div className="column">
							<div className="content">
								<p><Link to="/topics">{__('Public chat index')}</Link></p>
							</div>
						</div>
					</div>

					<Info />

					<div className="container">
						{client && (
							<div className="notification">
								<ClientInfo client={client}>
									<Version />
								</ClientInfo>
							</div>
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
