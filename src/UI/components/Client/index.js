import React from 'react';
import { __ } from 'Approot/misc/util';
import ClientInfo from './Info';

const Client = ({ client, activate, exprt }) => {
	return (
		<div className="container">
			<ClientInfo client={client} />

			<div className="section">
				<div className="buttons">
					<a className="button" onClick={activate}>
						{__('Switch to')}
					</a>
					<a className="button"i onClick={exprt}>
						{__('Export wallet')}
					</a>
				</div>
			</div>
		</div>
	);
};

export default Client;
