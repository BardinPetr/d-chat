/**
 * Contains the buttons that appear on level with username, when message is hovered.
 */

import React, { useState } from 'react';
// TODO there is a cascade of ReactModalPortals created. 1 for each toolbar, but should we make them all work from a single portal?
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import { getWhisperURL } from 'Approot/misc/util';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import TipJar from 'Approot/UI/containers/TipJar';
import { IoMdChatboxes } from 'react-icons/io';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';

Modal.setAppElement('#root');

const Toolbar = ({ id, topic, addr, addReaction }) => {
	const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
	return (
		<div className="x-is-hover buttons are-small are-white">
			<TipJar messageID={id} topic={topic} addr={addr} value={5} />
			<a
				className="button tooltip is-tooltip-left"
				onClick={() => setEmojiPickerVisible(true)}
				data-tooltip={__('Add reaction')}
			>
				😄
			</a>
			<Modal
				isOpen={!!emojiPickerVisible}
				onRequestClose={() => setEmojiPickerVisible(false)}
				contentLabel={__('Emoji picker dialog')}
				overlayClassName="x-modal-overlay"
				className="x-modal"
			>
				<div className="x-emoji-mart-container x-is-reactions-mart">
					<Picker
						autoFocus
						title={__('Emojis')}
						native={true}
						backgroundImageFn={() => {}}
						onSelect={emoji => {
							addReaction(emoji.native);
							setEmojiPickerVisible(false);
						}}
						emoji="droplet"
					/>
				</div>
			</Modal>
			<Link
				to={getWhisperURL(addr)}
				className="button tooltip is-tooltip-left"
				data-tooltip={__('Start a private conversation')}
			>
				<span className="icon is-small">
					<IoMdChatboxes />
				</span>
			</Link>
		</div>
	);
};

export default Toolbar;
