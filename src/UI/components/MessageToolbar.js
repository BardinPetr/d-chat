import React from 'react';
import 'tippy.js/themes/light-border.css';
import { Link } from 'react-router-dom';
import { getWhisperURL } from 'Approot/misc/util';
import { __ } from 'Approot/misc/browser-util';
import TipJar from 'Approot/UI/containers/TipJar';
import { IoMdChatboxes } from 'react-icons/io';

const Toolbar = ({ id, topic, addr }) => {
	return (
		<div className="x-is-hover buttons are-small are-white">
			<TipJar
				messageID={id}
				topic={topic}
				addr={addr}
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
