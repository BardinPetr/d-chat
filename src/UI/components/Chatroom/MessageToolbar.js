import React from 'react';
import { Link } from 'react-router-dom';
import { getWhisperURL } from 'Approot/misc/util';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import TipJar from 'Approot/UI/containers/TipJar';
import { IoMdChatboxes } from 'react-icons/io';

const Toolbar = ({ id, topic, addr }) => {
	return (
		<div className="x-is-hover buttons are-small are-white">
			<TipJar
				messageID={id}
				topic={topic}
				addr={addr}
				value={5}
			/>
			<TipJar
				messageID={id}
				topic={topic}
				value={500}
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
