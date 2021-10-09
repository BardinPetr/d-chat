import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import ClientInfo from 'Approot/UI/components/Client/Info';
import Info from 'Approot/UI/components/Info-APP_TARGET';
import { parseAddr, getChatURL, getWhisperURL, isWhisperTopic, getWhisperRecipient } from 'Approot/misc/util';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import Version from 'Approot/UI/components/Version';
import { FaQrcode } from 'react-icons/fa';
import { BiImageAdd } from 'react-icons/bi';
import { getBalance } from 'Approot/redux/actions/client';
import { updateContact } from 'Approot/redux/actions/contacts';
import Avatar from 'Approot/UI/containers/Avatar';

import ModalOpener from 'Approot/UI/components/ModalOpener';
import QRCode from 'Approot/UI/components/QRCode';

// Changing this? Change the tooltip too.
const MAX_AVATAR_SIZE = 10 * 1024; // 10kb.

const NewTopicForm = ({ privateChat }) => {
	const history = useHistory();
	const [target, setTarget] = useState('');
	const submit = e => {
		e.preventDefault();
		if (!target) {
			return;
		}
		let topic = target;
		let isPrivateChat = privateChat;
		// Kind of a hack: if you try to join topic '/whisper/asdf', then we will -
		// assume that you are trying to whisper 'asdf' instead.
		// We are doing this because otherwise you could join a valid whisper chat -
		// as a public chat, and chat histories, etc. would not like that.
		if (!isPrivateChat && isWhisperTopic(topic)) {
			isPrivateChat = true;
			topic = getWhisperRecipient(topic);
		}
		const t = isPrivateChat ? getWhisperURL(target) : getChatURL(target);
		history.push(t);
		setTarget('');
	};

	return (
		<form className="field" onSubmit={submit}>
			<div className="control">
				<input
					placeholder={privateChat ? __('Contact address') : __('Topic')}
					value={target}
					type="text"
					className="input is-small"
					onChange={e => setTarget(e.target.value)}
					maxLength="128"
				/>
			</div>
		</form>
	);
};

const Address = ({ addr }) => {
	const [name, key] = parseAddr(addr);
	return (
		<span className="x-address-broken x-address has-text-black">
			<span className="x-address-identifier">{name}</span>
			{name && '.'}
			<span className="x-address-pubkey">{key}</span>
		</span>
	);
};

const Home = ({ client, getBalance, updateContact }) => {
	const [error, setError] = useState(null);

	const onAvatarUpload = async e => {
		setError(null);
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}
		if (file.size > MAX_AVATAR_SIZE) {
			setError(
				<span className="help is-danger">
					{__('File too large. Max size is 10kb.')}
				</span>
			);
			return;
		}
		const data = await new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = e => {
				resolve(e.target.result);
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
		updateContact({
			addr: client.addr,
			// This type is for updating.
			requestType: 'response/full',
			content: {
				avatar: {
					type: 'base64',
					data,
				},
			},
		});
	};

	return (
		<div className="container x-home">
			<div className="">
				<div className="">
					<div className="section">
						{error}

						<div className="media">
							<div className="media-left">
								<label htmlFor="avatar-picker" className="label is-relative x-avatar-picker-label x-has-hover">
									<Avatar className="is-128x128" addr={client.addr} />
									{/* So this is why we don't mix css and js? It gets
										difficult to know what is going on.
										This element shows up on mouse over. */}
									<BiImageAdd
										className="x-is-hover is-96x96 image x-avatar-picker-opener has-text-primary-dark"
										aria-label={__('Open image picker.')}
									/>
									<input
										title={__('Profile picture. Click to upload new.')}
										type="file"
										id="avatar-picker"
										accept="image/*"
										className="is-overlay x-avatar-picker"
										onChange={onAvatarUpload}
									/>
								</label>
							</div>
							<div className="media-content">
								<div className="label has-text-weight-normal level is-mobile">
									<span className="level-left">{__('Contact address')}</span>
									<span className="level-right">
										<ModalOpener
											openerButtonClassName="button level-item"
											openerButtonContent={<span className="icon" title={__('QR Code')}><FaQrcode /></span>}
										>
											<QRCode value={client.addr} />
										</ModalOpener>
									</span>
								</div>
								<p>
									<Address addr={client.addr} />
								</p>
							</div>
						</div>

						<hr className="is-divider" />

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
					</div>

					<div className="section">
						<div className="content">
							<p><Link to="/topics">{__('Public chat index')}</Link></p>
							<Info />
						</div>

						{client && (
							<ClientInfo client={client} getBalance={getBalance}>
								<Version />
							</ClientInfo>
						)}
					</div>

				</div>
			</div>
		</div>
	);
};

const mapStateToProps = state => ({
	client: state.clients.find(i => i.active),
});

const mapDispatchToProps = dispatch => ({
	getBalance: address => dispatch(getBalance(address)),
	updateContact: contact => dispatch(updateContact(contact)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
