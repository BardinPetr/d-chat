import React from 'react';
import ReactDOM from 'react-dom';
import ReactTextareaAutocomplete from '@webscopeio/react-textarea-autocomplete';
import '@webscopeio/react-textarea-autocomplete/style.css';
import emoji from '@jukben/emoji-search';
import '../containers/App.css';
import Message from './Message.js';
import { __ } from '../../misc/util';

const AutofillItem = ({ entity: { name, char } }) => (
	<div>{`${name}: ${char}`}</div>
);

export default class Chatroom extends React.Component {
	componentDidMount() {
		this.scrollToBot();
		this.textarea.focus();
	}

	componentDidUpdate() {
		this.scrollToBot();
	}

	scrollToBot() {
		ReactDOM.findDOMNode(this.refs.messages).scrollTop = ReactDOM.findDOMNode(this.refs.messages).scrollHeight;
	}

	submitText = (e) => {
		e.preventDefault();

		let input = this.textarea;

		if (input.value === '') {
			return;
		}

		const message = {
			content: input.value,
			contentType: 'text',
		};

		this.props.createMessage(message);
		this.msg.setState({value: ''});
	}

	/**
	 * Makes enter submit, shift/ctrl enter insert newline.
	 */
	onEnterPress = e => {
		if ( e.keyCode === 13 && e.ctrlKey === false && e.shiftKey === false ) {
			e.preventDefault();
			this.submitText(e);
		}
		if ( e.keyCode === 13 && e.ctrlKey ) {
			e.preventDefault();
			this.msg.value += '\n';
		}
	}

	/**
	 * Stuff for react-textarea-autocomplete
	 */
	_outputCaretEnd = (item) => ({ text: item.char, caretPosition: 'end' });
	_outputCaretStart = item => ({ text: item.char, caretPosition: 'start' });
	_outputCaretNext = item => ({ text: item.char, caretPosition: 'next' });

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
					<ReactTextareaAutocomplete
						ref={msg => this.msg = msg}
						innerRef={ref => this.textarea = ref}
						onKeyDown={e => this.onEnterPress(e)}
						onChange={this.handleTextareaChange}
						trigger={{
							':': {
								dataProvider: token => emoji(token).slice(0, 5),
								component: AutofillItem,
								output: this._outputCaretEnd,
							}
						}}
						loadingComponent={() => <span className="loader" />}
					/>
					<input type="submit" value={ __('Submit') } />
				</form>
			</div>
		);
	}
}
