import React from 'react';

import { __ } from 'Approot/misc/browser-util-APP_TARGET';

import Logout from 'Approot/UI/containers/Logout';

const DefaultDots = () => (
	<Logout>
		{__('Log Out')}
	</Logout>
);

export default DefaultDots;
