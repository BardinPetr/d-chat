import React from 'react';
import './Footer.css';

const Footer = ({ logout }) => (
	<div className="pseudo-footer">
		<div onClick={logout} className="logout button">
			<span className="small">[Sign out]</span>
		</div>
	</div>
);

export default Footer;
