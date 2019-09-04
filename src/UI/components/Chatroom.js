/**
 * Contains messages list + submit box.
 */
import React from 'react';
import classnames from 'classnames';
import debounce from 'debounce';

import TextareaAutosize from 'react-autosize-textarea';
import TextareaAutoCompleter from './TextareaAutoCompleter';
import Message from 'Approot/UI/components/Message';
import { __, formatAddr } from 'Approot/misc/util';
import NknBalance from 'Approot/UI/containers/NknBalance';
import Reactions from 'Approot/UI/containers/Chatroom/Reactions';
import InfiniteScroller from 'react-infinite-scroller';

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

		this.lastReadId = props.unreadMessages[0];

		this.wasScrolledToBottom = true;
		this.onScroll = debounce(this.onScroll, 1000);

	}

	loadMoreMessages = () => {
		if ( this.props.messages.length > this.state.count ) {
			this.wasScrolledToBottom = false;
			this.setState({
				count: this.state.count + 5,
			});
		}
	}

	componentDidMount() {
		this.getSubsInterval = setInterval(() => this.props.getSubscribers(this.props.topic), 30000);
		this.props.getSubscribers(this.props.topic);

		if (this.refs.lastRead && this.props.unreadMessages.length) {
			this.refs.lastRead.scrollIntoView({ block: 'center' });
			this.wasScrolledToBottom = false;
		} else {
			this.scrollToBot();
		}

		this.markAllMessagesRead();
		this.msg.setState({
			value: this.props.draft,
		});

		/*
		componentWillUnmount doesn't work with the popup. It dies too fast.
		Workaround: save every change.
		*/
		this.textarea.addEventListener('change', this._saveDraft);
	}

	// Also cleared on submit.
	_saveDraft = e => this.props.saveDraft(e.target.value);

	markAllMessagesRead() {
		if (this.props.unreadMessages.length > 0) {
			this.props.markAsRead(this.props.topic, this.props.unreadMessages);
		}
	}

	componentWillUnmount() {
		this.textarea.removeEventListener('change', this._saveDraft);
		clearInterval(this.getSubsInterval);
	}

	componentDidUpdate(prevProps) {
		if ( prevProps.topic === this.props.topic && prevProps.messages.length < this.props.messages.length ) {
			this.setState({
				count: this.state.count + ( this.props.messages.length - prevProps.messages.length ),
			});
		}
		if ( this.wasScrolledToBottom ) {
			this.scrollToBot();
		}
	}

	scrollToBot() {
		this.messages.scrollTop = this.messages.scrollTopMax;
		this.wasScrolledToBottom = true;
	}

	submitText = (e) => {
		e.preventDefault();

		let inputValue = this.msg.state.value.trim();

		if (inputValue === '') {
			return;
		}

		const message = {
			content: inputValue,
			contentType: 'text',
			topic: this.props.topic, // TODO Deprecate and use topicHash instead
		};

		this.props.createMessage(message);
		this.msg.setState({value: ''});
		this.props.saveDraft('');
		this.textarea.focus();
	}

	/**
	 * Makes enter submit, shift enter insert newline.
	 */
	onEnterPress = e => {
		if ( e.keyCode === 13 && e.ctrlKey === false && e.shiftKey === false ) {
			e.preventDefault();
			this.submitText(e);
			this.msg.setState({value: ''});
		}
	}

	/**
	 * Click on name -> add @mention.
	 */
	refer = addr => {
		const caretPosition = this.msg.getCaretPosition();
		const currentValue = this.msg.state.value;
		const referral = mention(addr) + ' ';
		// https://stackoverflow.com/questions/4364881/inserting-string-at-position-x-of-another-string
		const value = [currentValue.slice(0, caretPosition), referral,  currentValue.slice(caretPosition)].join('');
		this.msg.setState({value}, () => {
			this.textarea.focus();
			this.msg.setCaretPosition(caretPosition + referral.length);
		});
	}

	togglePreview = ({showing}) => this.setState({
		showingPreview: showing,
	});

	onResize = (el) => {
		el.parentElement.parentElement.style.minHeight = el.style.height;
		if (this.wasScrolledToBottom) {
			this.scrollToBot();
		}
	}

	onScroll = (el) => {
		this.wasScrolledToBottom = false;
		// Bot
		if (el.scrollTop > el.scrollTopMax - 15) {
			this.markAllMessagesRead();
			this.wasScrolledToBottom = true;
		}
	}

	/**
	 * TODO Should split this thing up a bit. It's HUGE. Probably separate textfield and chatlist.
	 */
	render() {
		const { messages, topic, reactions } = this.props;

		const visibleMessages = messages.slice(-(this.state.count));

		// Flag to make sure we insert "NEW MESSAGES BELOW" only once.
		let didNotMarkYet = true;
		const messageList = visibleMessages.reduce((acc, message, idx) => {
			if ( didNotMarkYet && message.id === this.lastReadId ) {
				// Insert last read message thing.
				acc.push(
					<div className="level x-last-read" key={message.id + 'lastRead'}>
						<hr ref="lastRead" className="level-item has-background-primary" />
						<span className="level-item is-size-7 has-text-grey has-text-centered is-uppercase">{__('New messages below')}</span>
						<hr className="level-item has-background-primary is-hidden-mobile" />
					</div>
				);
				didNotMarkYet = false;
			}

			const reactionsForMessage = reactions[message.id] || [];

			return acc.concat(
				<Message
					className={classnames('', {
						'x-me': message.isMe,
						'x-refers-to-me': message.refersToMe,
					})}
					refer={this.refer}
					message={message}
					isSubscribed={this.props.subs.includes(message.addr)}
					key={message.id + idx}
					isNotice={['dchat/subscribe'].includes(message.contentType)}
					topic={topic}
				>
					{reactionsForMessage.length > 0 &&
						<Reactions
							reactions={reactionsForMessage}
							topic={topic}
							createMessage={this.props.createMessage}
						/>
					}
				</Message>
			);
		}, []);

		return (
			<div className="hero is-fullheight-with-navbar x-is-fullwidth">
				<div className="hero-body x-is-align-start x-is-small-padding x-is-fixed-height" ref={ref => this.messages = ref} onScroll={e => this.onScroll(e.target)}>
					<InfiniteScroller
						pageStart={0}
						isReverse
						loadMore={this.loadMoreMessages}
						hasMore={visibleMessages.length < messages.length}
						loader={<div className="is-loader" key={0} />}
						initialLoad={false}
						useWindow={false}
						threshold={100}
						className="x-is-fullwidth"
					>
						<div className="container">
							<div className="x-chat">
								{ messageList }
							</div>
						</div>
					</InfiniteScroller>
				</div>
				<div className="hero-foot">
					<form className="card" onSubmit={(e) => this.submitText(e)}>
						<div className="card-content x-is-small-padding field">
							<div className={classnames('control')}>
								<TextareaAutoCompleter
									topic={topic}
									innerRef={ref => this.textarea = ref}
									ref={ref => this.msg = ref}
									onKeyDown={this.onEnterPress}
									onResize={(e) => this.onResize(e.target)}
									autoFocus
									textAreaComponent={{
										component: TextareaAutosize,
										ref: 'innerRef',
									}}
									subs={this.props.subs}
									mention={mention}
									showingPreview={this.state.showingPreview}
									source={this.msg?.state.value || ''}
								/>
							</div>
							<div className="level is-mobile">
								<div className="level-left">
									<div className="tabs is-small x-tabs-has-bigger-border">
										<ul>
											<li className={classnames('', {
												'is-active': !this.state.showingPreview,
											})} onClick={() => this.togglePreview({ showing: false })}>
												<a>{__('Text')}</a>
											</li>
											<li className={classnames('', {
												'is-active': this.state.showingPreview,
											})} onClick={() => this.togglePreview({ showing: true })}>
												<a>{__('Preview')}</a>
											</li>
										</ul>
									</div>
								</div>
								<div className="level-right">
									<div className="level-item">
										<NknBalance />
									</div>
									<input type="submit" className="button is-small is-primary level-item" value={ __('Submit') } />
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		);
	}
}

export default Chatroom;
