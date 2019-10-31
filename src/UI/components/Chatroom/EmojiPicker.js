import React from 'react';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const EmojiPicker = ({ onSelect }) => (
	<div className="x-emoji-mart-container">
		<Picker
			autoFocus
			title={__('Emojis')}
			native={true}
			backgroundImageFn={() => {}}
			onSelect={onSelect}
			emoji="droplet"
		/>
	</div>
);

export default EmojiPicker;
