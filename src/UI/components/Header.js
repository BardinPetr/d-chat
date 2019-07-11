import React from 'react';
import Modal from 'react-modal';
import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem } from 'rc-menu';
import 'rc-dropdown/assets/index.css';
import { IoMdOpen } from 'react-icons/io';
import { IS_FIREFOX, __, getChatName } from '../../misc/util';
import { runtime, tabs, windows } from 'webextension-polyfill';

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
		const { subscribing, topic, enterChatroom, connected } = this.props;
		return (
			<div>
				<Modal
					isOpen={this.state.modalIsOpen}
					onRequestClose={this.closeModal}
					style={customStyles}
					onAfterOpen={() => this.refs.topicInput.focus()}
				>
					<h2 className="title">{ __('Enter channel name') }</h2>
					<form className="input narrow" onSubmit={this.handleAccept}>
						<input type="text" ref="topicInput" onChange={this.handleTopicChange} />
						<button type="submit" className="input submit">{ __('Go') }</button>
					</form>
				</Modal>

				{ topic ? (
					<span className="chatroom-header">
						<span className="back" onClick={() => enterChatroom(null)}>{'< ' + __('Back')}</span>
						<span className="chatname" title={getChatName(topic)}>{getChatName(topic)}</span>
						<span className={subscribing ? 'loader loader-margin' : 'empty'} title={ __('Subscribing...') }></span>
					</span>
				) : (
					<span className="chatlist-header">
						<Popout />
						<span className="title">{ __('D-Chat') }</span>
						<span className={`join-button new ${!connected ? 'disabled' : ''}`} title={!connected ? __('Connecting...') : undefined } onClick={this.openModal}>{ __('Join') }</span>
					</span>
				)
				}
			</div>
		);
	}
}
export default Header;
