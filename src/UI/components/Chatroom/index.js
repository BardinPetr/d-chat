/**
 * Contains messages list + submit box.
 */
import React from 'react';

import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { formatAddr } from 'Approot/misc/util';
import Messages from './Messages';
import Textarea from './Textarea';

const mention = addr => '@' + formatAddr(addr);

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
	}

	loadMoreMessages = () => {
		if (this.props.messages.length > this.state.count) {
			this.setState({
				count: this.state.count + 5,
			});
		}
	};

	componentDidMount() {
		/*
		componentWillUnmount doesn't work with the popup. It dies too fast.
		Workaround: save every change.
		*/
		this.textarea.addEventListener('change', this._saveDraft);
		this.mounter();
	}

	// Also cleared on submit.
	_saveDraft = e => this.props.saveDraft(e.target.value);

	markAllMessagesRead() {
		if (this.props.unreadMessages.length > 0) {
			this.props.markAsRead(this.props.topic, this.props.unreadMessages);
			this.lastReadId = undefined;
		}
	}

	componentWillUnmount() {
		this.textarea.removeEventListener('change', this._saveDraft);
		this.unmounter();
	}

	mounter = () => {
		this.getSubsInterval = setInterval(
			() => this.props.getSubscribers(this.props.topic),
			25000,
		);
		this.props.getSubscribers(this.props.topic);

		this.lastReadId = this.props.unreadMessages[0];
		this.msg.setState({
			value: this.props.draft,
		});
	};

	unmounter = () => {
		clearInterval(this.getSubsInterval);
	};

	componentDidUpdate(prevProps) {
		if (prevProps.topic !== this.props.topic) {
			// Start over
			this.unmounter();
			this.mounter();
			this.setState({
				count: 15 + this.props.unreadMessages.length,
			});
		} else if (
			prevProps.topic === this.props.topic &&
			prevProps.messages.length < this.props.messages.length
		) {
			this.setState({
				count:
					this.state.count +
					(this.props.messages.length - prevProps.messages.length),
			});
		}
	}

	submitText = e => {
		e.preventDefault();

		let inputValue = this.msg.state.value.trim();

		if (inputValue === '') {
			return;
		}

		const message = {
			content: inputValue,
			contentType: 'text',
			// About transmitting the hashed topic: that will make UI between different apps bad.
			// One app will get messages to "topichash" and have "hash -> topic clearname" map interanally,
			// But other apps will not have the mapping, and will have to have something to work around that.
			// Maybe do it anyways? Maybe it is worth it privacy-wise.?
			topic: this.props.topic,
		};

		this.props.createMessage(message);
		this.msg.setState({ value: '' });
		this.props.saveDraft('');
		this.textarea.focus();
	};

	submitUpload = data => {
		if (!/^(data:video|data:audio|data:image)/.test(data)) {
			return;
		}
		const content = `![](${data})`;
		const message = {
			content: content,
			contentType: 'media',
			topic: this.props.topic,
		};
		this.props.createMessage(message);
	};

	/**
	 * Makes enter submit, shift enter insert newline.
	 */
	onEnterPress = e => {
		if (e.keyCode === 13 && e.ctrlKey === false && e.shiftKey === false) {
			e.preventDefault();
			this.submitText(e);
			this.msg.setState({ value: '' });
		}
	};

	/**
	 * Click on name -> add @mention.
	 */
	refer = addr => {
		const caretPosition = this.msg.getCaretPosition();
		const currentValue = this.msg.state.value;
		const referral = mention(addr) + ' ';
		// https://stackoverflow.com/questions/4364881/inserting-string-at-position-x-of-another-string
		const value = [
			currentValue.slice(0, caretPosition),
			referral,
			currentValue.slice(caretPosition),
		].join('');
		this.msg.setState({ value }, () => {
			this.textarea.focus();
			this.msg.setCaretPosition(caretPosition + referral.length);
		});
	};

	togglePreview = ({ showing }) =>
		this.setState({
			showingPreview: showing,
		});

	render() {
		const { messages, client, subs } = this.props;
		let placeholder = `${__('Message as')} ${client.addr}`;
		placeholder = `${placeholder.slice(0, 30)}...${placeholder.slice(-5)}`;

		const visibleMessages = messages.slice(-this.state.count);

		return (
			<div className="hero is-fullheight-with-navbar x-is-fullwidth">
				<Messages
					className="hero-body x-is-align-start x-is-small-padding x-is-fixed-height"
					messages={visibleMessages}
					hasMore={visibleMessages.length < messages.length}
					loadMore={this.loadMoreMessages}
					refer={this.refer}
					lastReadId={this.lastReadId}
					subs={subs}
					markAllMessagesRead={() => this.markAllMessagesRead()}
				/>

				<div className="hero-foot">
					<Textarea
						innerRef={ref => (this.textarea = ref)}
						mention={mention}
						onEnterPress={this.onEnterPress}
						placeholder={placeholder}
						ref={ref => (this.msg = ref)}
						submitText={this.submitText}
						submitUpload={this.submitUpload}
						subs={this.props.subs}
						source={this.msg?.state.value || ''}
					>
						<div className="level-item">
							<p className="has-text-grey">
								{this.props.client.balance || '?'} NKN
							</p>
						</div>
					</Textarea>
				</div>

			</div>
		);
	}
}

export default Chatroom;
