/**
 * Used in containers/Home.js, quite useless otherwise.
 */
import React, { useState, useEffect } from 'react';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import OldWalletExporter from './ExportOldWallet-APP_TARGET';
import WalletExporter from './WalletExporter';
import { IoIosHelpCircleOutline as IoIosHelpCircle } from 'react-icons/io';
import ModalOpener from 'Approot/UI/components/ModalOpener';
import QRCode from 'Approot/UI/components/QRCode';
import { FaQrcode } from 'react-icons/fa';
import useInterval from '@rooks/use-interval';
import 'bulma-tooltip/dist/css/bulma-tooltip.min.css';

const ClientInfo = ({ client, children, getBalance }) => {
	const [expanded, setExpanded] = useState(false);
	const { start } = useInterval(() => {
		getBalance(client.wallet.Address);
	}, 10000);
	useEffect(() => {
		start();
	}, []);
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
								{__('Show more account information')}
							</a>
						)}
					</div>
				</div>
				{expanded && (
					<div className="tile is-vertical">
						<div className="tile is-child">
							<div className="field">
								<div className="label has-text-weight-normal level is-mobile">
									<span className="level-left">
										{__('Wallet address')}
										<span
											className="icon tooltip is-size-5"
											data-tooltip={__('Share this for receiving NKN payments.')}
										>
											<IoIosHelpCircle className="is-size-5" />
										</span>
									</span>
									<span className="level-right">
										<ModalOpener
											openerButtonClassName="button level-item"
											openerButtonContent={<span className="icon" title={__('QR Code')}><FaQrcode /></span>}
										>
											<QRCode value={client.wallet.Address} />
										</ModalOpener>
									</span>
								</div>
								<p className="x-address-broken x-address">{client.wallet.Address}</p>
							</div>
						</div>
						<div className="tile is-child">
							<div className="field">
								<WalletExporter wallet={client.wallet} />
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
