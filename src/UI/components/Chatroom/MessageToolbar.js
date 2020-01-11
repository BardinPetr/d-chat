/**
 * Contains the buttons that appear on level with username, when message is hovered.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { getWhisperURL, formatAddr, } from 'Approot/misc/util';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import TipJar from 'Approot/UI/containers/TipJar';
import { IoMdChatboxes } from 'react-icons/io';

const Toolbar = ({ id, topic, addr }) => {
	return (
		<div className="x-toolbar-content x-is-padding-left">
			<div className="buttons has-addons x-toolbar-buttons">
				<TipJar
					messageID={id}
					topic={topic}
					addr={addr}
					value={5}
					className="button is-text"
					title={`Tip 5 sats to ${formatAddr(addr) || '???'}...`}
				/>
				<Link
					to={getWhisperURL(addr)}
					className="button is-text"
					title={__('Start a private conversation')}
				>
					<span className="icon is-small">
						<IoMdChatboxes />
					</span>
				</Link>
			</div>
		</div>
	);
};

export default Toolbar;
