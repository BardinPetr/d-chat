import React from 'react';
import './Footer.css';
import { __ } from 'Approot/misc/util';

const Footer = ({ logout }) => (
	<div className="pseudo-footer">
		<div onClick={logout} className="logout button">
			<span className="small">[{ __('Sign out') }]</span>
		</div>
	</div>
);

export default Footer;
