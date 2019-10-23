import React from 'react';
import TopicLink from 'Approot/UI/components/TopicLink';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

export const HTTPSInfo = () => null;

const Info = () => {
	return (
		<div className="container">
			<p className="field" style={{wordBreak: 'keep-all'}}>
				{__('Come and say hi on channel')} <TopicLink topic="d-chat" />.
			</p>
		</div>
	);
};

export default Info;