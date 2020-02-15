import React, { useState } from 'react';
import { connect } from 'react-redux';
import { activeClient } from 'Approot/redux/reducers/client';
import { createMessage } from 'Approot/redux/actions';
import TipJar from 'Approot/UI/containers/TipJar';
import Dropdown from 'Approot/UI/components/Dropdown';
import { IoIosMore, IoIosEyeOff } from 'react-icons/io';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import EmojiPicker from 'Approot/UI/components/Chatroom/EmojiPicker';

const Actions = ({
	addr,
	addReaction,
	deleted,
	deleteMessage,
	id,
	isMyMessage,
	topic,
}) => {
	const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
	const closeEmojiPicker = () => setEmojiPickerVisible(false);
	const openEmojiPicker = () => setEmojiPickerVisible(true);

	const onSelect = emoji => {
		addReaction(emoji);
		closeEmojiPicker();
	};

	return (
		<>
			{emojiPickerVisible && (
				<EmojiPicker
					onSelect={onSelect}
					onClose={closeEmojiPicker}
				/>
			)}
			<div className="x-message-actions x-is-hover">
				<Dropdown
					triggerClassName="is-light is-hovered is-rounded"
					triggerIcon={<IoIosMore className="is-size-5" />}
					id={`actions-${id}`}
					isRight={true}
				>
					<a className="dropdown-item" onClick={openEmojiPicker}>
						<span className="icon">
							<i className="fa fa-smile-o" />
						</span>
						<span>{__('Add reaction')}</span>
					</a>
					<TipJar
						messageID={id}
						topic={topic}
						recipientAddr={addr}
						className="dropdown-item"
					/>
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
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	deleteMessage: () => dispatch(createMessage({
		contentType: 'message/delete',
		topic: ownProps.message.topic,
		targetID: ownProps.message.id,
	})),
	addReaction: (emoji) => dispatch(createMessage({
		contentType: 'reaction',
		topic: ownProps.message.topic,
		targetID: ownProps.message.id,
		content: emoji.native,
	})),
});

export default connect(mapStateToProps, mapDispatchToProps)(Actions);
