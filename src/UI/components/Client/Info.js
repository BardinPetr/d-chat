/**
 * Used in containers/Home.js, quite useless otherwise.
 */
import React, { useState } from 'react';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import OldWalletExporter from './ExportOldWallet-APP_TARGET';
import WalletExporter from './WalletExporter';
import { IoIosHelpCircleOutline as IoIosHelpCircle } from 'react-icons/io';

const ClientInfo = ({ client, children }) => {
	const [expanded, setExpanded] = useState(false);
	return (
		<div
			className={'tile is-ancestor'}
			style={{ overflowWrap: 'anywhere', wordBreak: 'all' }}
		>
			<div className="tile is-parent is-vertical">
				<div className="tile">
					<div className="field">
						{!expanded && (
							<a
								className="button is-link is-outlined is-size-7"
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
								<p className="is-size-7 has-text-grey-darker">
									{__('Wallet address')}
									<span className="icon tooltip is-size-5" data-tooltip={__('Share this for receiving NKN payments.')}><IoIosHelpCircle className="is-size-5" /></span>
								</p>
								<p className="x-address-broken x-address">{client.wallet.Address}</p>
							</div>
						</div>
						<div className="tile is-child">
							<div className="field">
								<WalletExporter wallet={client.wallet}>
									{__('Export wallet')}
								</WalletExporter>
							</div>
						</div>
						<div className="tile is-child">
							<div className="field">
								<p className="is-size-7 has-text-grey-darker">{__('Wallet balance')}</p>
								<p>{client.balance || '?'} NKN</p>
							</div>
							{children}
						</div>
						<div className="tile is-child">
							<div className="field">
								<OldWalletExporter />
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ClientInfo;
