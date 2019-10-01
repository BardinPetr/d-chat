import React from 'react';
import { __, VERSION } from 'Approot/misc/browser-util-APP_TARGET';

const Version = () => (
	<div className="field">
		<p className="is-size-7">{__('D-Chat version')}</p>
		<p>{VERSION}</p>
	</div>
);

export default Version;
