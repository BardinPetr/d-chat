import React from 'react';
import Modal from 'react-modal';
import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem } from 'rc-menu';
import '../rc-dropdown.css';
import { IoMdOpen } from 'react-icons/io';
import { IS_FIREFOX, __, getChatDisplayName } from '../../misc/util';
import { runtime, tabs, windows } from 'webextension-polyfill';
import SubscriberList from '../containers/SubscriberList';
import NknBalance from '../containers/NknBalance';

Modal.setAppElement('#root');

const popout = type => {
	switch (type) {
		case 'panel':
			windows.create({
				url: runtime.getURL('sidebar.html'),
				type: 'panel',
				height: 700,
				width: 550,
			});
			break;

		case 'tab':
			tabs.create({
				url: runtime.getURL('sidebar.html'),
			});
			break;
	}
};


const customStyles = {
	content: {
		inset: 0,
		position: IS_FIREFOX ? 'relative' : 'absolute',
		margin: 'auto',
		height: 'min-content'
	},
	overlay: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	}
};

const MyMenu = (
	<Menu selectedKeys={[]} className="dropdown">
		<MenuItem className="dropdown-item" onClick={() => popout('panel')} key="1">{__('Panel')}</MenuItem>
		<MenuItem className="dropdown-item" onClick={() => popout('tab')} key="2">{__('Tab')}</MenuItem>
	</Menu>
);

const Popout = () => (
	<span className="new popout">
		<Dropdown
			trigger={['click']}
			overlay={MyMenu}
		>
			<IoMdOpen title={ __('Pop Out') } />
		</Dropdown>
	</span>
);

class Header extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			modalIsOpen: false,
			topic: '',
		};
	}

	openModal = () => {
		this.setState({modalIsOpen: true});
	}

	closeModal = () => {
		this.setState({modalIsOpen: false});
	}

	handleAccept = (e) => {
		e.preventDefault();
		this.closeModal();
		this.newChat();
	}

	newChat = async () => {
		let topic = this.state.topic;
		if (!topic) {
			return;
		}

		topic = topic.trim();
		if (!topic.length) {
			return;
		}

		this.props.enterChatroom(topic);
	};

	handleTopicChange = (e) => {
		this.setState({topic: e.target.value});
	}

	render() {
		const { topic, enterChatroom, connected } = this.props;
		return (
			<header className="chat-header">
				<Modal
					isOpen={this.state.modalIsOpen}
					onRequestClose={this.closeModal}
					style={customStyles}
					onAfterOpen={() => this.refs.topicInput.focus()}
				>
					<h2 className="title">{ __('Enter channel name') }</h2>
					<form className="input narrow input-channel-form" onSubmit={this.handleAccept}>
						<input type="text" ref="topicInput" onChange={this.handleTopicChange} />
						<button type="submit" className="submit">{ __('Go') }</button>
					</form>
					<p className="description">
						{__('You will need some NKN to subscribe to chats.') + ' '}
					</p>
					<p className="description">
						{__('Your balance')}: <NknBalance />
					</p>
				</Modal>

				{ topic ? (
					<span className="chatroom-header">
						<span className="back" onClick={() => enterChatroom(null)}>{'< ' + __('Back')}</span>
						<span className="chatname" title={getChatDisplayName(topic)}>{getChatDisplayName(topic)}</span>
						<SubscriberList />
					</span>
				) : (
					<span className="chatlist-header">
						<Popout />
						<span className="title">{ __('D-Chat') }</span>
						<span className={`join-button new ${!connected ? 'disabled' : ''}`} title={!connected ? __('Connecting...') : undefined } onClick={this.openModal}>{ __('Join') }</span>
					</span>
				)
				}
			</header>
		);
	}
}
export default Header;
