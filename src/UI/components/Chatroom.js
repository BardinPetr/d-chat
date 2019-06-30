import React from 'react';
import ReactDOM from 'react-dom';
// import './App.css';
import Message from './Message.js';
import { __ } from '../../misc/util';

export default class Chatroom extends React.Component {
	componentDidMount() {
		this.scrollToBot();
		this.refs.msg.focus();
	}

	componentDidUpdate() {
		this.scrollToBot();
	}

	scrollToBot() {
		ReactDOM.findDOMNode(this.refs.messages).scrollTop = ReactDOM.findDOMNode(this.refs.messages).scrollHeight;
	}

	submitText = (e) => {
		e.preventDefault();

		let input = ReactDOM.findDOMNode(this.refs.msg);

		if (input.value === '') {
			return;
		}

		this.props.createMessage(input.value, 'text');

		input.value = '';
	}

	render() {
		const { chat } = this.props;

		return (
			<div className="chatroom">
				<ul className="messages" ref="messages">
					{
						chat && chat.messages && chat.messages.map((message, index) => (
							<Message message={message} key={index} />
						))
					}
				</ul>
				<form className="input" onSubmit={(e) => this.submitText(e)}>
					<input type="text" ref="msg" />
					<input type="submit" value={ __('Submit') } />
				</form>
			</div>
		);
	}
}
