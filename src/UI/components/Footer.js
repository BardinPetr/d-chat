import React from 'react';
import './Footer.css';
import NknBalance from '../containers/NknBalance';
import { __ } from 'Approot/misc/util';

const Footer = ({ logout }) => (
	<div className="pseudo-footer">
		<div className="left">
			<div onClick={logout} className="logout button">
				[{ __('Sign out') }]
			</div>
		</div>
		<div className="right">
			[<NknBalance />]
		</div>
	</div>
);

export default Footer;
