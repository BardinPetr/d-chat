import React from 'react';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const Profile = ({profile}) => (
	<div className="">
		<p className="subtitle">{__('Contact address')}</p>
		<p className="x-address x-address-broken">{profile}</p>
	</div>
);

export default Profile;
