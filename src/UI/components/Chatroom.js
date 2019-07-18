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
 *
 * Man, what a mess.
 */
export default class Chatroom extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			count: 15,
		};
		// New messages will be "extra".
		this.extraCount = 0;
		this.isScrolledToBottom = true;
	}

	loadMore = () => {
		this.setState({
			count: this.state.count + 10,
		});
	}

	componentDidMount() {
		this.scrollToBot();
		this.textarea.focus();
	}

	componentDidUpdate() {
		if ( this.isScrolledToBottom ) {
			this.scrollToBot();
		}
	}

	componentWillUpdate() {
		const { messages } = this.refs;
		const scrollPosition = messages.scrollTop;
		const scrollBottom = (messages.scrollHeight - messages.clientHeight);
		this.isScrolledToBottom = (scrollBottom <= 0) || (scrollPosition === scrollBottom);
		this.extraCount += 1;
	}

	scrollToBot() {
		ReactDOM.findDOMNode(this.refs.messages).scrollTop = ReactDOM.findDOMNode(this.refs.messages).scrollHeight;
		this.isScrolledToBottom = true;
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
		const allMessages = this.props.messages || [];
		const messages = allMessages.slice( -(this.state.count + this.extraCount) );
		const hasMore = (messages.length < allMessages.length);

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
								messages.map(message => (
									<Message message={message} key={message.id || ('' + message.ping + message.content) } />
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
