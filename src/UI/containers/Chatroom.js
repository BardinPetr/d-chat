/**
 * Contains messages list + submit box.
 *
 * TODO make VisibilitySensor change badge text instantly, move chatlist & textarea code into their own components.
 * Maybe drop the whole VisibilitySensor and think of something else.
 * Probably do something to improve the chat rendering. It basically renders every time.
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import ReactDOM from 'react-dom';
import InfiniteScroll from 'react-infinite-scroller';
import VisibilitySensor from 'react-visibility-sensor';
import TextareaAutosize from 'react-autosize-textarea';
import '../containers/App.css';
import Message from '../components/Message';
import { __, formatAddr } from '../../misc/util';
import { markRead, publishMessage, saveDraft } from 'Approot/redux/actions';
import Markdown from '../components/Markdown';

const mention = (addr) => ('@' + formatAddr(addr));

/**
 * Consists of existing messages and the text form.
 *
 * Marks messages read as well.
 */
class Chatroom extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			count: 15 + props.unreadMessages.length,
			showingPreview: false,
		};
		this.unreadCount = props.unreadMessages.length;
		this.wasScrolledToBottom = true;
		this.markedRead = new Set;
		this.textarea = React.createRef();
	}

	loadMore = () => {
		this.setState({
			count: this.state.count + 10,
		});
	}

	componentDidMount() {
		if (this.refs.lastRead) {
			this.refs.lastRead.scrollIntoView({ block: 'center' });
		} else {
			this.scrollToBot();
		}
		this.textarea.current.focus();
		this.textarea.current.value = this.props.draft;
		/*
		componentWillUnmount doesn't work with the popup. It dies too fast.
		Workaround: save every change.
		*/
		this.textarea.current.addEventListener('change', this._saveDraft);
	}

	// Also saved in submit (as empty string).
	_saveDraft = e => this.props.saveDraft(e.target.value);

	/**
	 * Since componentWillUnmount does not "make it" when the popup is closed by clicking elsewhere, listen for mouse to go over the edge.
	 */
	onMouseLeave = () => {
		this.markRead();
	}

	markRead() {
		if (this.markedRead.size > 0) {
			if (this.props.unreadMessages.length > 0) {
				this.props.markAsRead(this.props.topic, Array.from(this.markedRead));
			}
			this.markedRead.clear();
		}
	}

	markAllRead() {
		if (this.props.unreadMessages.length > 0) {
			this.props.markAsRead(this.props.topic, this.props.unreadMessages);
		}
		this.markedRead.clear();
	}

	componentWillUnmount() {
		this.textarea.current.removeEventListener('change', this._saveDraft);
		this.markRead();
	}

	componentDidUpdate() {
		if ( this.wasScrolledToBottom ) {
			this.scrollToBot();
		}
	}

	componentWillUpdate() {
		const { messages } = this.refs;
		const scrollPosition = messages.scrollTop;
		const scrollBottom = (messages.scrollHeight - messages.clientHeight);
		this.wasScrolledToBottom = (scrollBottom <= 0) || (scrollPosition === scrollBottom);
	}

	scrollToBot() {
		ReactDOM.findDOMNode(this.refs.messages).scrollTop = ReactDOM.findDOMNode(this.refs.messages).scrollHeight;
		this.wasScrolledToBottom = true;
	}

	submitText = (e) => {
		e.preventDefault();

		let inputValue = this.textarea.current.value.trim();

		if (inputValue === '') {
			return;
		}

		const message = {
			content: inputValue,
			contentType: 'text',
		};

		this.props.createMessage({ ...message, topic: this.props.topic });
		this.textarea.current.setState({value: ''});
		this.props.saveDraft('');
		this.textarea.current.focus();
	}

	/**
	 * Makes enter submit, shift enter insert newline.
	 */
	onEnterPress = e => {
		if ( e.keyCode === 13 && e.ctrlKey === false && e.shiftKey === false ) {
			e.preventDefault();
			this.submitText(e);
		}
	}

	/**
	 * Click on name -> add @mention.
	 */
	refer = addr => {
		// const caretPosition = this.textarea.getCaretPosition();
		// const currentValue = this.textarea.state.value;
		// https://stackoverflow.com/questions/4364881/inserting-string-at-position-x-of-another-string
		// const value = [currentValue.slice(0, caretPosition), mention( addr ) + ' ',  currentValue.slice(caretPosition)].join('');
		// this.textarea.setState({
		// 	value
		// }, () => this.textarea.focus());
	}

	/**
	 * A queue system for marking messages read.
	 */
	queueMarkRead = id => {
		this.markedRead.add(id);
	}

	togglePreview = () => this.setState({
		showingPreview: !this.state.showingPreview,
	});

	/**
	 * Stuff for react-textarea-autocomplete
	 */
	_outputCaretEnd = (item) => ({ text: item.char, caretPosition: 'end' });

	/**
	 * TODO Should split this thing up a bit. It's HUGE.
	 */
	render() {
		const { subs, unreadMessages, messages } = this.props;
		// Messages that are being loaded.
		const visibleMessages = messages.slice( -(this.state.count) );

		const messageList = visibleMessages.reduce((acc, message, idx) => {
			if ( visibleMessages.length - this.unreadCount === idx ) {
				acc.push(<hr ref="lastRead" key={message.id + 'lastRead'}/>);
			}
			return acc.concat(
				<li key={message.id} className={classnames('message', {
					me: message.isMe,
					'refers-to-me': message.refersToMe,
				})}>
					{ ( unreadMessages.some(i => i === message.id) ) ?
						(
							<VisibilitySensor
								onChange={visible => visible && this.queueMarkRead(message.id)}
								scrollCheck={true}
							>
								<Message
									refer={this.refer}
									message={message}
									isSubscribed={subs.includes(message.addr)}
								/>
							</VisibilitySensor>
						) : (
							<Message
								refer={this.refer}
								message={message}
								isSubscribed={subs.includes(message.addr)}
							/>
						) }
				</li>
			);
		}, []);

		return (
			<div className="messages-container-outer" onMouseLeave={this.onMouseLeave}>
				<div className="messages-container" ref="messages">
					<InfiniteScroll
						pageStart={0}
						isReverse
						loadMore={this.loadMore}
						hasMore={(visibleMessages.length < messages.length)}
						loader={<div className="loader" key={0} />}
						useWindow={false}
						initialLoad={false}
					>
						<ul className="messages">
							{ messageList }
						</ul>
					</InfiniteScroll>
					<VisibilitySensor onChange={vis => vis && this.markAllRead()}>
						<hr className="sensor" />
					</VisibilitySensor>
				</div>
				<form className="input" onSubmit={(e) => this.submitText(e)}>
					<div className="form-text-area">
						<TextareaAutosize
							rows={3}
							maxRows={15}
							ref={this.textarea}
							className={classnames('', {
								hidden: this.state.showingPreview
							})}
						/>
						{ this.state.showingPreview &&
							<div className={classnames('preview')}>
								<Markdown
									source={this.textarea.current?.value}
								/>
							</div>
						}
					</div>
					<div className="form-footer">
						<div className="button-group">
							<button type="button" className="button preview-button" onClick={this.togglePreview}>
								{this.state.showingPreview ? __('Text') : __('Preview')}
							</button>
						</div>
						<div className="flex-filler"></div>
						<div className="button-group">
						</div>
						<input type="submit" value={ __('Submit') } />
					</div>
				</form>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	draft: state.draftMessage,
	messages: state.messages[state.topic] || [],
	topic: state.topic,
	subs: state.subscribers,
	unreadMessages: state.chatSettings[state.topic]?.unread || [],
});

const mapDispatchToProps = dispatch => ({
	createMessage: message => dispatch(publishMessage(message)),
	saveDraft: draft => dispatch(saveDraft(draft)),
	markAsRead: (topic, ids) => dispatch(markRead(topic, ids)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Chatroom);
