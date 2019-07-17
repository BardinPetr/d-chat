import React from 'react';
import ReactDOM from 'react-dom';
import InfiniteScroll from 'react-infinite-scroller';
import ReactTextareaAutocomplete from '@webscopeio/react-textarea-autocomplete';
import '@webscopeio/react-textarea-autocomplete/style.css';
import emoji from '@jukben/emoji-search';
import '../containers/App.css';
import Message from './Message.js';
import { __ } from '../../misc/util';

const AutofillItem = ({ entity: { name, char } }) => (
	<div>{`${name}: ${char}`}</div>
);

/**
 * Consists of existing messages and the text form.
 */
export default class Chatroom extends React.Component {
	state = {
		count: 15,
		// messages: this.props.messages.slice(0, 15),
	}

	loadMore = () => {
		this.setState({
			count: this.state.count + 10,
			// messages: this.props.messages.slice(0, this.state.messages.length + 10),
		});
	}

	componentDidMount() {
		this.scrollToBot();
		this.textarea.focus();
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
		const { count } = this.state;
		const messages = this.props.messages.slice(0, count);
		const hasMore = (messages.length < this.props.messages.length);

		return (
			<div className="messages-container-outer">
				<div className="messages-container" ref="messages">
					<InfiniteScroll
						pageStart={0}
						isReverse
						loadMore={this.loadMore}
						hasMore={hasMore}
						loader={<div className="loader" key={0} />}
						useWindow={false}
						initialLoad={false}
					>
						<ul className="messages">
							{
								messages && messages.map((message, index) => (
									<Message message={message} key={index} />
								))
							}
						</ul>
					</InfiniteScroll>
				</div>
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
