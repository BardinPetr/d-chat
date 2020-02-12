import React from 'react';
import Modal from 'react-modal';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

Modal.setAppElement('.dashboard');

function noop() {}

const EmojiPicker = ({ onSelect, onClose }) => (
	<Modal
		isOpen={true}
		onRequestClose={onClose}
		contentLabel={__('Emoji picker dialog')}
		className="x-modal"
	>
		<div className="x-emoji-mart-container">
			<Picker
				title={__('Emojis')}
				native={true}
				backgroundImageFn={noop}
				onSelect={onSelect}
				emoji="droplet"
			/>
		</div>
	</Modal>
);

export default EmojiPicker;
