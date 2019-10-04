import React from 'react';
import TopicLink from 'Approot/UI/components/TopicLink';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

export const HTTPSInfo = () => null;

const Info = () => {
	return (
		<div className="container">
			<p className="field" style={{wordBreak: 'keep-all'}}>
				{__('Join channel')}
				{' '}<TopicLink topic="d-chat" />{' '}
				{__('and say hi! Someone will tip you coins.')}
			</p>
		</div>
	);
};

export default Info;
