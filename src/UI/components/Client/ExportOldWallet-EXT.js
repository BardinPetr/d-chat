/**
 * Exports old wallet.
 *
 * Before version 4.0.0, the 'default' wallet was stored in 'configs.walletJSON'.
 * Some people lost that wallet, apparently.
 */
import React, { useState } from 'react';
import { storage } from 'webextension-polyfill';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const ExportOldWallet = () => {
	const [oldWallet, setOldWallet] = useState(null);
	storage.local.get('walletJSON')
		.then((obj) => {
			if (obj.walletJSON && !oldWallet) {
				setOldWallet(obj.walletJSON);
			}
		});

	return (
		oldWallet && (
			<div className="section container">
				<p>{__('Lost a wallet you had in an older version of D-Chat?')}</p>
				<a download={`oldwallet.json`} className="button is-small"
					href={`data:text/plain;charset=utf-8,${encodeURIComponent(oldWallet)}`}
				>
					{__('Export it.')}
				</a>
			</div>
		)
	);
};

export default ExportOldWallet;
