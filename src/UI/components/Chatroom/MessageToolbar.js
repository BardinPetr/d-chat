/**
 * Contains the buttons that appear on level with username, when message is hovered.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { getWhisperURL } from 'Approot/misc/util';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import TipJar from 'Approot/UI/containers/TipJar';
import { IoMdChatboxes } from 'react-icons/io';

const Toolbar = ({ id, topic, addr, addReaction }) => {
	return (
		<div className="x-is-hover buttons has-addons are-small">
			<TipJar className="" messageID={id} topic={topic} addr={addr} value={5} />
			<a
				className="button tooltip is-tooltip-left"
				onClick={() => {
					addReaction('👍');
				}}
				data-tooltip={__('Like')}
			>
				<span className="icon is-small">
					👍
				</span>
			</a>
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
