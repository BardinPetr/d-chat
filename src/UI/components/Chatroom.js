import React from 'react';
import ReactDOM from 'react-dom';
import '../containers/App.css';
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

		const message = {
			content: input.value,
			contentType: 'text',
			timestamp: new Date().toUTCString(),
		};

		this.props.createMessage(message);

		input.value = '';
	}

	render() {
		const { messages } = this.props;

		return (
			<div className="chatroom">
				<ul className="messages" ref="messages">
					{
						messages && messages.map((message, index) => (
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
