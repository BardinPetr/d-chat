import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import ClientInfo from 'Approot/UI/components/Client/Info';
import Info from 'Approot/UI/components/Info-APP_TARGET';
import { parseAddr, getChatURL, getWhisperURL, isWhisperTopic, getWhisperRecipient } from 'Approot/misc/util';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import history from 'Approot/UI/history';
import Version from 'Approot/UI/components/Version';
import { FaQrcode } from 'react-icons/fa';
import { getBalance } from 'Approot/redux/actions/client';
import { updateContact } from 'Approot/redux/actions/contacts';
import { getContact } from 'Approot/database/contacts';

import ModalOpener from 'Approot/UI/components/ModalOpener';
import QRCode from 'Approot/UI/components/QRCode';

const NewTopicForm = ({ privateChat }) => {
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
	const [contact, setContact] = useState({});
	const refreshContact = () => getContact(client.addr).then(
		c => c && (console.log('contact',c) || setContact(c))
	);
	useEffect(() => {
		refreshContact();
	}, [client.addr]);

	const onUpload = async e => {
		const file = e.target.files?.[0];
		if (!file) {
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
		await updateContact({
			addr: client.addr,
			avatar: {
				type: 'base64',
				data,
			},
			firstName: '',
			lastName: '',
		});
		refreshContact();
	};

	return (
		<div className="container">
			<div className="">
				<div className="">
					<div className="section">

						<div className="media">
							<div className="media-left">
								<label htmlFor="avatar-picker" className="label">
									<img className="image is-128x128" src={contact?.content?.avatar?.data} alt={__('Profile picture')} />
								</label>
								<input type="file" id="avatar-picker" accept="image/*" className="is-hidden" onChange={onUpload} />
							</div>
							<div className="media-content">
								<div className="label has-text-weight-normal level is-mobile">
									<span className="level-left">{__('Contact address')}</span>
									<span className="level-right">
										<ModalOpener
											openerButtonClassName="button level-item"
											openerButtonContent={<span className="icon"><FaQrcode /></span>}
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
							<p>{__('Give the mobile app a try!')} <a target="_blank" rel="noopener noreferrer" href="https://forum.nkn.org/t/nmobile-pre-beta-community-testing-and-simple-guide/2012">{__('nMobile pre-beta')}</a>.</p>
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
