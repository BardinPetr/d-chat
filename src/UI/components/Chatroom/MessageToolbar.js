import React, { useState } from 'react';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import { getWhisperURL } from 'Approot/misc/util';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import TipJar from 'Approot/UI/containers/TipJar';
import { IoMdChatboxes } from 'react-icons/io';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';

Modal.setAppElement('#root');

const Toolbar = ({ id, topic, addr }) => {
	const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
	return (
		<div className="x-is-hover buttons are-small are-white">
			<TipJar
				messageID={id}
				topic={topic}
				addr={addr}
				value={50}
			/>
			<a className="level-item icon button is-white has-text-grey-dark" onClick={() => setEmojiPickerVisible(true)}>
				😄
			</a>
			<Modal
				isOpen={!!emojiPickerVisible}
				onRequestClose={() => setEmojiPickerVisible(null)}
				contentLabel={__('Emoji picker dialog')}
				overlayClassName="x-modal-overlay"
				className="x-modal"
			>
				<div className="x-emoji-mart-container">
					<Picker
						autoFocus
						title={__('Emojis')}
						native={true}
						backgroundImageFn={() => {}}
						onSelect={emoji => {
							// TODO
							console.log(emoji);
							setEmojiPickerVisible(null);
						}}
						emoji="droplet"
					/>
				</div>
			</Modal>
			<Link to={getWhisperURL(addr)} className="button tooltip is-tooltip-left" data-tooltip={__('Start a private conversation')}>
				<span className="icon is-small">
					<IoMdChatboxes />
				</span>
			</Link>
		</div>
	);
};

export default Toolbar;
