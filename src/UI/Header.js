import React from 'react';
import Modal from 'react-modal';
import { IoMdOpen } from 'react-icons/io';

Modal.setAppElement('#root');

import { getChatName } from './util';
import { __ } from './util';

const customStyles = {
	content: {
		position: 'relative',
		inset: 0,
	},
	overlay: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	}
};

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

		console.log('Entered topic:', topic);

		await this.props.createChatroom(topic);
		this.props.enterChatroom(topic);
	};

	handleTopicChange = (e) => {
		this.setState({topic: e.target.value});
	}

	render() {
		const { subscribing, topic, enterChatroom } = this.props;
		return (
			<div>
				<Modal
					isOpen={this.state.modalIsOpen}
					onRequestClose={this.closeModal}
					style={customStyles}
					onAfterOpen={() => this.refs.topicInput.focus()}
				>
					<h2 className="title">{ __('Enter channel name') }</h2>
					<form className="input" onSubmit={this.handleAccept}>
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
						<span className="new popout" onClick={this.props.popout}>
							<IoMdOpen title={ __('Pop Out') } />
						</span>
						<span className="title">{ __('D-Chat') }</span>
						<span className="new" onClick={this.openModal}>{ __('Join') }</span>
					</span>
				)
				}
			</div>
		);
	}
}
export default Header;
