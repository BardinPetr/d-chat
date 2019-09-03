import React from 'react';
import { connect } from 'react-redux';
import { __ } from 'Approot/misc/util';
import ClientInfo from 'Approot/UI/components/Client/Info';
import { switchToClient, exportClient } from 'Approot/redux/actions/client';

const Client = ({ client, dispatch }) => {
	return (
		<div className="container">
			<ClientInfo client={client} />

			<div className="section">
				<div className="buttons">
					<button type="button" className="button" onClick={() => dispatch(switchToClient(client))}>
						{__('Switch to')}
					</button>
					<button type="button" className="button">
						{__('Export')}
					</button>
				</div>
			</div>
		</div>
	);
};

const mapStateToProps = (state, ownProps) => ({
	client: state.clients.find(c => c.wallet.address === ownProps.match.params.address),
});

export default connect(mapStateToProps)(Client);
