import React from 'react';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const ClientInfo = ({ client, className, children }) => (
	<div className={className} style={{overflowWrap: 'anywhere', wordBreak: 'all'}}>
		<div className="field">
			<p className="is-size-7">{__('Nickname')}</p>
			<p style={{userSelect: 'all'}}>{client.addr}</p>
		</div>
		<div className="field">
			<p className="is-size-7">{__('Wallet address')}</p>
			<p style={{userSelect: 'all'}}>
				{client.wallet.Address}
			</p>
		</div>
		<div className="field">
			<p className="is-size-7">{__('Wallet balance')}</p>
			<p>
				{client.balance || '?'} NKN
			</p>
		</div>
		{ children }
	</div>
);

export default ClientInfo;
