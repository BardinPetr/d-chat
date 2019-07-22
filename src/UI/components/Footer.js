import React from 'react';
import './Footer.css';

const Footer = ({ logout }) => (
	<footer>
		<div onClick={logout} className="logout button">
			<span className="small">[Sign out]</span>
		</div>
	</footer>
);

export default Footer;
