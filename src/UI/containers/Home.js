import React, { useState } from 'react';
import { connect } from 'react-redux';
import ClientInfo from 'Approot/UI/components/Client/Info';
import Info from 'Approot/UI/components/Info-APP_TARGET';
import { getChatURL, getWhisperURL } from 'Approot/misc/util';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import history from 'Approot/UI/history';
import Version from 'Approot/UI/components/Version';

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
		<div className="container">{client && (
			<div className="notification">
				<ClientInfo client={client}>
					<Version />
				</ClientInfo>
			</div>
		)}</div>

		<div className="container" style={{ paddingTop: 0 }}>
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
					</div>
					<Info />
				</div>
			</div>
		</div>
	</section>
);

const mapStateToProps = state => ({
	client: state.clients.find(i => i.active),
});

export default connect(mapStateToProps)(Home);
