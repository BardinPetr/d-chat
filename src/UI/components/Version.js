import React from 'react';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import PACKAGE from 'Approot/../package.json';

const Version = () => (
	<div className="field">
		<p className="is-size-7">{__('D-Chat version')}</p>
		<p>{PACKAGE.version}</p>
	</div>
);

export default Version;
