import React from 'react';
import { connect } from 'react-redux';
import { activeClient } from 'Approot/redux/reducers/client';
import { createMessage } from 'Approot/redux/actions';
import TipJar from 'Approot/UI/containers/TipJar';
import Dropdown from 'Approot/UI/components/Dropdown';
import { IoIosMore, IoIosEyeOff } from 'react-icons/io';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const Actions = ({ id, topic, isMyMessage, deleteMessage, addr, deleted }) => (
	<div className="x-message-actions x-is-hover">
		<Dropdown
			triggerClassName="is-light is-hovered is-rounded"
			triggerIcon={<IoIosMore className="is-size-5" />}
			id={`actions-${id}`}
			isRight={true}
		>
			<TipJar
				messageID={id}
				topic={topic}
				recipientAddr={addr}
				className="dropdown-item"
			/>
			{isMyMessage && !deleted && (
				<a className="dropdown-item button is-light has-text-danger" onClick={deleteMessage}>
					<span className="icon">
						<IoIosEyeOff />
					</span>
					<span>{__('Delete message')}</span>
				</a>
			)}
		</Dropdown>
	</div>
);

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
	}))
});

export default connect(mapStateToProps, mapDispatchToProps)(Actions);
