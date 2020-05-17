import React, { useState, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { activeClient } from 'Approot/redux/reducers/client';
import { createMessage } from 'Approot/redux/actions';
import { toggleUserMute } from 'Approot/redux/actions/settings';
import TipJar from 'Approot/UI/containers/TipJar';
import Dropdown from 'Approot/UI/components/Dropdown';
import { IoIosMore, IoIosEyeOff, IoMdChatboxes } from 'react-icons/io';
import { FaBan, FaRegSmile } from 'react-icons/fa';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { getWhisperURL } from 'Approot/misc/util';

// I don't think lazy loading it has any performance improvement, but here we go anyways.
const LazyEmojiPicker = lazy(() => import('Approot/UI/components/Chatroom/EmojiPicker'));

const Actions = ({
	addr,
	addReaction,
	deleted,
	deleteMessage,
	id,
	isMyMessage,
	muted,
	toggleUserMute,
	topic,
}) => {
	const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
	const closeEmojiPicker = () => setEmojiPickerVisible(false);
	const openEmojiPicker = () => setEmojiPickerVisible(true);

	const onSelect = emoji => {
		addReaction(emoji.native);
		closeEmojiPicker();
	};
	const toggleMute = () => toggleUserMute(addr);
	const quicksend = () => addReaction('👍');

	return (
		<>
			{emojiPickerVisible && (
				<Suspense fallback={<div className="is-hidden" />}>
					<LazyEmojiPicker
						onSelect={onSelect}
						onClose={closeEmojiPicker}
					/>
				</Suspense>
			)}
			<div className="x-message-actions x-is-hover">
				<Dropdown
					triggerClassName="x-message-toolbar-side-dropdown"
					triggerIcon={<IoIosMore className="is-size-5" />}
					id={`actions-${id}`}
					isRight={true}
					isUp={true}
				>
					<a className="dropdown-item" onClick={openEmojiPicker}>
						<span className="icon">
							<FaRegSmile />
						</span>
						<span>{__('Add reaction')}</span>
					</a>
					<a className="dropdown-item" onClick={quicksend}>
						<span className="icon">
							👍
						</span>
						<span>{__('Thumbs up')}</span>
					</a>
					<Link
						to={getWhisperURL(addr)}
						className="dropdown-item"
					>
						<span className="icon">
							<IoMdChatboxes />
						</span>
						<span>{__('Start a private conversation')}</span>
					</Link>
					<TipJar
						messageID={id}
						topic={topic}
						recipientAddr={addr}
						className="dropdown-item"
					/>
					{!isMyMessage && (
						<a className={classnames('dropdown-item', {
							'has-text-danger': !muted,
						})} onClick={toggleMute}>
							<span className="icon">
								<FaBan />
							</span>
							<span>{muted ? __('Unignore user') : __('Ignore user')}</span>
						</a>
					)}
					{isMyMessage && !deleted && (
						<a className="dropdown-item has-text-danger" onClick={deleteMessage}>
							<span className="icon">
								<IoIosEyeOff />
							</span>
							<span>{__('Delete message')}</span>
						</a>
					)}
				</Dropdown>
			</div>
		</>
	);
};

const mapStateToProps = (state, ownProps) => {
	const message = ownProps.message;
	const { addr } = activeClient(state.clients);
	return {
		isMyMessage: addr === message.addr,
		id: message.id,
		topic: message.topic,
		addr: message.addr,
		deleted: message.deleted,
		muted: state.globalSettings.muted.includes(message.addr),
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	deleteMessage: () => dispatch(createMessage({
		contentType: 'event:message/delete',
		topic: ownProps.message.topic,
		targetID: ownProps.message.id,
	})),
	addReaction: (emoji) => dispatch(createMessage({
		contentType: 'reaction',
		topic: ownProps.message.topic,
		targetID: ownProps.message.id,
		content: emoji,
	})),
	toggleUserMute: addr => dispatch(toggleUserMute(addr)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Actions);
