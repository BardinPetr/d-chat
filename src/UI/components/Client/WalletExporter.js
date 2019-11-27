import React from 'react';

const WalletExporter = ({ className = '', wallet, children }) => (
	<a
		className={`button ${className}`}
		download={`${wallet.Address}.json`}
		href={`data:text/plain;charset=utf-8,${encodeURIComponent(
			JSON.stringify(wallet, null, 2),
		)}`}
	>
		{children}
	</a>
);

export default WalletExporter;
