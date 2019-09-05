import React from 'react';
import 'tippy.js/themes/light-border.css';
import { Link } from 'react-router-dom';
import { getWhisperURL, __ } from 'Approot/misc/util';
import EmojiPicker from './EmojiPicker';
import { IoMdChatboxes } from 'react-icons/io';

const Toolbar = ({ id, topic, addr, showEmojiPicker }) => {
	return (
		<div className="x-is-hover buttons are-small are-white">
			<EmojiPicker
				id={id}
				topic={topic}
				addr={addr}
				isHidden={showEmojiPicker}
			/>
			<Link to={getWhisperURL(addr)} className="button tooltip is-tooltip-left" data-tooltip={__('Start a private conversation')}>
				<span className="icon is-small">
					<IoMdChatboxes />
				</span>
			</Link>
		</div>
	);
};

export default Toolbar;
