import React from 'react';
import { __ } from 'Approot/misc/util';
import NknBalance from 'Approot/UI/containers/NknBalance';

const Info = ({ client, children }) => (
	<div className="notification" style={{marginBottom: 0, overflowWrap: 'anywhere', wordBreak: 'all'}}>
		<div className="field">
			<p className="is-size-7">{__('You are known as')}</p>
			<p style={{userSelect: 'all'}}>{client.addr}</p>
		</div>
		<div className="field">
			<p className="is-size-7">{__('Your wallet address is')}</p>
			<p style={{userSelect: 'all'}}>
				{client.wallet.address}
			</p>
		</div>
		<div className="field">
			<p className="is-size-7">{__('Your wallet balance')}</p>
			<NknBalance wallet={client.wallet} />
		</div>
		{ children }
	</div>
);

export default Info;
