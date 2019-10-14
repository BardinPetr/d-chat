import React, { useState } from 'react';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const ClientInfo = ({ client, children }) => {
	const [expanded, setExpanded] = useState(false);
	return (
		<div
			className={'tile is-ancestor'}
			style={{ overflowWrap: 'anywhere', wordBreak: 'all' }}
		>
			<div className="tile is-parent is-vertical">
				<div className="tile is-child">
					<div className="field">
						<p className="is-size-7">{__('Contact address')}</p>
						<p style={{ userSelect: 'all' }}>{client.addr}</p>
						{!expanded && (
							<a
								className="button is-light is-size-7"
								title={__('Expands on click')}
								onClick={() => setExpanded(true)}
							>
								{__('More...')}
							</a>
						)}
					</div>
				</div>
				{expanded && (
					<div className="tile is-vertical">
						<div className="tile is-child">
							<div className="field">
								<p className="is-size-7">{__('Wallet address')}</p>
								<p style={{ userSelect: 'all' }}>{client.wallet.Address}</p>
							</div>
						</div>
						<div class="tile is-child">
							<div className="field">
								<p className="is-size-7">{__('Wallet balance')}</p>
								<p>{client.balance || '?'} NKN</p>
							</div>
							{children}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ClientInfo;
