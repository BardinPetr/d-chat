import React from 'react';
import { QRCode } from 'react-qr-svg';

const MyQRCode = ({ value }) => (
	<div className="x-qr-code">
		<span className="x-qr-code-icon icon">
			<QRCode value={value} />
		</span>
	</div>
);

export default MyQRCode;
