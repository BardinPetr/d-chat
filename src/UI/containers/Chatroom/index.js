/**
 * Contains messages list + submit box.
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import sleep from 'sleep-promise';

import TextareaAutosize from 'react-autosize-textarea';
import Message from '../../components/Message';
import { __, formatAddr, getChatDisplayName } from 'Approot/misc/util';
import { getSubscribers, markRead, publishMessage, saveDraft } from 'Approot/redux/actions';
import Markdown from '../../components/Markdown';
import NknBalance from 'Approot/UI/containers/NknBalance';
import Reactions from 'Approot/UI/containers/Chatroom/Reactions';

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
		this.textarea = React.createRef();

	}

	loadMoreMessages = () => {
		this.setState({
			count: this.state.count + 10,
		});
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
		this.textarea.current.focus();
		this.textarea.current.value = this.props.draft;

		/*
		componentWillUnmount doesn't work with the popup. It dies too fast.
		Workaround: save every change.
		*/
		this.textarea.current.addEventListener('change', this._saveDraft);
	}

	// Also cleared on submit.
	_saveDraft = e => this.props.saveDraft(e.target.value);

	markAllMessagesRead() {
		if (this.props.unreadMessages.length > 0) {
			this.props.markAsRead(this.props.topic, this.props.unreadMessages);
		}
	}

	componentWillUnmount() {
		this.textarea.current.removeEventListener('change', this._saveDraft);
		clearInterval(this.getSubsInterval);
	}

	componentDidUpdate() {
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

		let inputValue = this.textarea.current.value.trim();

		if (inputValue === '') {
			return;
		}

		const message = {
			content: inputValue,
			contentType: 'text',
			topic: this.props.topic, // TODO Deprecate and use topicHash instead
		};

		this.props.createMessage(message);
		this.textarea.current.value = '';
		this.props.saveDraft('');
		this.textarea.current.focus();
	}

	/**
	 * Makes enter submit, shift enter insert newline.
	 */
	onEnterPress = e => {
		// Fix bug where key sequence '<s-enter>x' will scroll.
		if (this.wasScrolledToBottom) {
			sleep(0).then(() => this.scrollToBot());
		}
		if ( e.keyCode === 13 && e.ctrlKey === false && e.shiftKey === false ) {
			e.preventDefault();
			this.submitText(e);
		}
	}

	/**
	 * Click on name -> add @mention.
	 */
	refer = addr => {
		const caretPosition = this.textarea.current.selectionEnd;
		const currentValue = this.textarea.current.value;
		const referral = mention(addr) + ' ';
		// https://stackoverflow.com/questions/4364881/inserting-string-at-position-x-of-another-string
		const value = [currentValue.slice(0, caretPosition), referral,  currentValue.slice(caretPosition)].join('');
		this.textarea.current.value = value;
		this.textarea.current.focus();
		this.textarea.current.selectionEnd = caretPosition + referral.length;
	}

	togglePreview = ({showing}) => this.setState({
		showingPreview: showing,
	});

	onScroll = (el) => {
		this.wasScrolledToBottom = false;
		// Top
		if (el.scrollTop <= 50 && this.props.messages.length > this.state.count) {
			this.loadMoreMessages();
		}
		// Bot
		if (el.scrollTop > el.scrollTopMax - 25) {
			this.markAllMessagesRead();
			this.wasScrolledToBottom = true;
		}
	}

	/**
	 * TODO Should split this thing up a bit. It's HUGE.
	 */
	render() {
		const { subscribing, messages, topic } = this.props;

		const all = messages.reduce((acc, msg) => {
			switch (msg.contentType) {
				case 'nkn/tip':
				case 'reaction':
					acc.reactions.push(msg);
					break;

				case 'text':
				default:
					acc.messages.push(msg);
			}
			return acc;
		}, { reactions: [], messages: [] });

		// Flag to make sure we insert "NEW MESSAGES BELOW" only once.
		let didNotMarkYet = true;
		const messageList = all.messages.slice(-(this.state.count)).reduce((acc, message, idx) => {
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

			const reactions = all.reactions.filter(reaction => reaction.targetID === message.id);

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
				>
					{reactions.length > 0 &&
						<Reactions
							reactions={reactions}
						/>
					}
				</Message>
			);
		}, []);

		return (
			<div className="hero is-fullheight-with-navbar x-is-fullwidth">
				<div className="hero-body x-is-align-start x-is-small-padding x-is-fixed-height" ref={ref => this.messages = ref} onScroll={e => this.onScroll(e.target)}>
					<div className="container">
						<div className="x-chat">
							{ messageList }
						</div>
					</div>
				</div>
				<div className="hero-foot">
					<form className="card" onSubmit={(e) => this.submitText(e)}>
						<div className="card-content x-is-small-padding field">
							<div className={classnames('control', {
								'is-loading': subscribing,
							})}>
								<TextareaAutosize
									rows={1}
									maxRows={10}
									ref={this.textarea}
									className={classnames('textarea', {
										'is-hidden': this.state.showingPreview,
										'is-warning': subscribing,
									})}
									placeholder={`${__('Message')} ${getChatDisplayName(topic)}`}
									onKeyDown={this.onEnterPress}
									onResize={() => this.wasScrolledToBottom && this.scrollToBot()}
								/>
								{ this.state.showingPreview &&
									<Markdown
										source={this.textarea.current?.value}
									/>
								}
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

const mapStateToProps = (state, ownProps) => ({
	draft: state.draftMessage,
	messages: state.messages[ownProps.match.params.topic] || [],
	unreadMessages: state.chatSettings[ownProps.match.params.topic]?.unread || [],
	topic: ownProps.match.params.topic,
	subscribing: Object.keys(state.subscriptions).includes(ownProps.match.params.topic),
	subs: state.chatSettings[ownProps.match.params.topic]?.subscribers || [],
});

const mapDispatchToProps = dispatch => ({
	createMessage: message => dispatch(publishMessage(message)),
	saveDraft: draft => dispatch(saveDraft(draft)),
	markAsRead: (topic, ids) => dispatch(markRead(topic, ids)),
	getSubscribers: (topic) => dispatch(getSubscribers(topic)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Chatroom);
