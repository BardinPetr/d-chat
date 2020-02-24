/**
 * Contains the buttons that appear on level with username, when message is hovered.
 */

import React from 'react';
import { isPermissionedTopic } from 'Approot/misc/util';
import AdminKickSwitch from 'Approot/UI/containers/Admin';

const Toolbar = ({ topic, addr }) => (
	<div className="x-toolbar">
		{isPermissionedTopic(topic) && (
			<AdminKickSwitch
				addr={addr}
				topic={topic}
			/>
		)}
	</div>
);

export default Toolbar;
