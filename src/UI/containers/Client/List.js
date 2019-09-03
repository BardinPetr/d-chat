import React, { useState } from 'react';
import { connect } from 'react-redux';
import Client from 'Approot/UI/components/Client';
import classnames from 'classnames';
import { download, importWallet } from 'Approot/misc/util';
import { switchToClient, newWallet } from 'Approot/redux/actions/client';

const ClientList = ({ clients, dispatch }) => {
	const [active, setActive] = useState(null);

	return (
		<div className="container">
			<section className="accordions">
				{ clients.map((client, i) => (
					<div className={classnames('accordion', {
						'is-active': active === client.addr,
						'is-primary': client.dchat.active,
					})} key={i}>
						<div
							className={classnames('accordion-header toggle')}
							onClick={() => setActive(client.addr)}
						>
							<p>{client.addr}</p>
						</div>
						<div className="accordion-body">
							<div className="accordion-content">
								<Client
									client={client}
									activate={() => dispatch(switchToClient(client))}
									exprt={() => download({
										filename: client.wallet.address,
										data: client.wallet.toJSON()
									})}
								/>
							</div>
						</div>
					</div>
				))}
				<div className="section">
					<a className="button" onClick={() => dispatch(newWallet(importWallet()))}>
						{__('Import wallet')}
					</a>
				</div>
			</section>
		</div>
	);
};

const mapStateToProps = (state) => ({
	clients: [...state.clients].sort((a, b) => a.addr =< b.addr ? a.addr === b.addr ? 0 : -1 : 1),
});

export default connect(mapStateToProps)(ClientList);
