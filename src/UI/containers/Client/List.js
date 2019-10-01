import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Client from 'Approot/UI/components/Client';
import classnames from 'classnames';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { switchToClient } from 'Approot/redux/actions/client';

const ClientList = ({ clients, dispatch }) => {
	const [expanded, setExpanded] = useState([]);

	return (
		<section className="section x-is-small-padding x-is-fullwidth">
			<div className="container">
				<div className="accordions">
					{ clients.map((client, i) => (
						<div className={classnames('accordion', {
							'is-active': expanded.includes(client.addr),
							'is-success': client.active,
						})} key={i}>
							<div
								className={classnames('accordion-header toggle x-truncate')}
								onClick={() => setExpanded(expanded.includes(client.addr) ? expanded.filter(i => i!==client.addr) : expanded.concat(client.addr))}
							>
								<p>{client.addr}</p>
							</div>
							<div className="accordion-body">
								<div className="accordion-content">
									<Client
										client={client}
										activate={() => dispatch(switchToClient(client.wallet.Address))}
									/>
								</div>
							</div>
						</div>
					))}
					<div className="container">
						<Link to="/wallets/import" className="button">
							{__('Import')}
						</Link>
						<Link to="/wallets/new" className="button">
							{__('New')}
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

const mapStateToProps = (state) => ({
	clients: state.clients,
});

export default connect(mapStateToProps)(ClientList);
