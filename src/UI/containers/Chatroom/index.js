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
import VisibilitySensor from 'react-visibility-sensor';
import TextareaAutosize from 'react-autosize-textarea';
import Message from '../../components/Message';
import { __, formatAddr } from 'Approot/misc/util';
import { getSubscribers, markRead, publishMessage, saveDraft } from 'Approot/redux/actions';
import Markdown from '../../components/Markdown';
import debounce from 'debounce';
import NknBalance from 'Approot/UI/containers/NknBalance';

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
			subs: [],
		};
		this.unreadCount = props.unreadMessages.length;
		this.wasScrolledToBottom = true;
		this.textarea = React.createRef();
		// Mark all unread messages as read on chat opening.
		// this.markAllRead();
		this.onScrollTop = debounce(this.onScrollTop, 300);

		this.getSubsInterval = setInterval(() => this.props.getSubscribers(props.topic).then(
			(subs) => this.setState({subs})
		), 60000);
	}

	loadMore = () => {
		console.log('Loading more messages', this.state.count);
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

		this.props.getSubscribers(this.props.topic).then(
			(subs) => this.setState({subs})
		);
		/*
		componentWillUnmount doesn't work with the popup. It dies too fast.
		Workaround: save every change.
		*/
		this.textarea.current.addEventListener('change', this._saveDraft);
	}

	// Also saved in submit (as empty string).
	_saveDraft = e => this.props.saveDraft(e.target.value);

	markAllRead() {
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

	UNSAFE_componentWillUpdate() {
		const scrollPosition = this.messages.scrollTop;
		const scrollBottom = (this.messages.scrollHeight - this.messages.clientHeight);
		this.wasScrolledToBottom = (scrollBottom <= 0) || (scrollPosition === scrollBottom);
	}

	scrollToBot() {
		this.messages.scrollTop = this.messages.scrollHeight;
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

	onScrollTop = (el) => {
		if (el.scrollTop <= 25 && this.props.messages.length > this.state.count) {
			this.loadMore();
		}
	}

	/**
	 * TODO Should split this thing up a bit. It's HUGE.
	 */
	render() {
		const { subscribing, messages } = this.props;
		// Messages that are being loaded.
		const visibleMessages = messages.slice( -(this.state.count) );

		const messageList = visibleMessages.reduce((acc, message, idx) => {
			if ( visibleMessages.length - this.unreadCount === idx ) {
				acc.push(
					<div className="level x-last-read" key={message.id + 'lastRead'}>
						<hr ref="lastRead" className="level-item has-background-primary" />
						<span className="level-item is-size-7 has-text-grey has-text-centered is-uppercase">{__('New messages below')}</span>
						<hr className="level-item has-background-primary is-hidden-mobile" />
					</div>
				);
			}
			return acc.concat(
				<Message
					className={classnames('', {
						'x-me': message.isMe,
						'x-refers-to-me': message.refersToMe,
					})}
					refer={this.refer}
					message={message}
					isSubscribed={this.state.subs.includes(message.addr)}
					key={message.id || idx}
				/>
			);
		}, []);

		return (
			<div className="hero is-fullheight-with-navbar x-is-fullwidth" onMouseLeave={this.onMouseLeave}>
				<div className="hero-body x-is-align-start x-is-small-padding x-is-fixed-height" ref={ref => this.messages = ref} onScroll={e => this.onScrollTop(e.target)}>
					<div className="container">
						<div className="x-chat">
							{ messageList }
						</div>
						<VisibilitySensor onChange={vis => vis && this.markAllRead()}>
							<hr className="x-sensor" />
						</VisibilitySensor>
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
									})}
									onKeyDown={this.onEnterPress}
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
