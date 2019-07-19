import React from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import InfiniteScroll from 'react-infinite-scroller';
import ReactTextareaAutocomplete from '@webscopeio/react-textarea-autocomplete';
import '@webscopeio/react-textarea-autocomplete/style.css';
import emoji from '@jukben/emoji-search';
import '../containers/App.css';
import Message from '../components/Message.js';
import { __ } from '../../misc/util';
import { publishMessage, saveDraft } from 'Approot/redux/actions';

const AutofillItem = ({ entity: { name, char } }) => (
	<div>{`${name}: ${char}`}</div>
);

/**
 * Consists of existing messages and the text form.
 *
 * Man, what a mess.
 */
class Chatroom extends React.Component {
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
		this.msg.setState({ value: this.props.draft });
		/*
		componentWillUnmount doesn't work with the popup. It dies too fast.
		Workaround: save every change.
		*/
		this.textarea.addEventListener('change', this._saveDraft);
	}

	// Also saved in submit (as empty string).
	_saveDraft = e => this.props.saveDraft(e.target.value);

	componentWillUnmount() {
		this.textarea.removeEventListener('change', this._saveDraft);
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

		let input = this.msg.state;

		if (input.value === '') {
			return;
		}

		const message = {
			content: input.value,
			contentType: 'text',
		};

		this.props.createMessage({ ...message, topic: this.props.topic });
		this.msg.setState({value: ''});
		this.props.saveDraft('');
	}

	/**
	 * Makes enter submit, shift/ctrl enter insert newline.
	 */
	onEnterPress = e => {
		if ( e.keyCode === 13 && e.ctrlKey === false && e.shiftKey === false ) {
			e.preventDefault();
			this.submitText(e);
		} else if ( e.keyCode === 13 && e.ctrlKey ) {
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
		const allMessages = this.props.messages[this.props.topic] || [];
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

const mapStateToProps = state => ({
	draft: state.draftMessage,
	messages: state.messages,
	topic: state.topic,
});

const mapDispatchToProps = dispatch => ({
	createMessage: message => dispatch(publishMessage(message)),
	saveDraft: draft => dispatch(saveDraft(draft)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Chatroom);
