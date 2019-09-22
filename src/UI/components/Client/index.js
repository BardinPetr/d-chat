import React from 'react';
import { __ } from 'Approot/misc/browser-util';
import ClientInfo from './Info';

const Client = ({ activate, client }) => {
	return (
		<div className="container box">
			<ClientInfo client={client} />

			<div style={{ paddingTop: '0.5rem' }}>
				<div className="buttons are-small">
					<a className="button" onClick={activate}>
						{__('Activate')}
					</a>
					<a
						className="button"
						download={`${client.wallet.Address}.json`}
						href={`data:text/plain;charset=utf-8,${encodeURIComponent(
							JSON.stringify(client.wallet, null, 2),
						)}`}
					>
						{__('Export')}
					</a>
				</div>
			</div>
		</div>
	);
};

export default Client;
