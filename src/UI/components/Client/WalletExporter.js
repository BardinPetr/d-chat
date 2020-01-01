import React, { useState } from 'react';
import classnames from 'classnames';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import WalletPasswordVerifier from 'Approot/UI/components/WalletPasswordVerifier';

const WalletExporter = ({ wallet }) => {
	const [showDialog, setShowDialog] = useState(false);
	const [seed, setSeed] = useState('');
	const onClick = e => {
		e.preventDefault();
		setShowDialog(true);
	};

	const close = e => {
		setSeed('');
		setShowDialog(false);
		e?.preventDefault();
	};

	return (
		<div className="buttons">
			<a
				className="button"
				download={`${wallet.Address}.json`}
				href={`data:text/plain;charset=utf-8,${encodeURIComponent(
					JSON.stringify(wallet, null, 2),
				)}`}
			>
				{__('Export wallet')}
			</a>
			<a
				className="button"
				onClick={onClick}
			>
				{__('Show secret seed')}
			</a>
			<div className={classnames('modal', {
				'is-active': showDialog,
			})}>
				<div className="modal-background" onClick={close} />
				<div className="modal-content">
					<div className="box">
						{seed ? (
							<div className="section">
								<div className="title">{__('Your Wallet Seed')}</div>
								<div className="content has-text-dark">
									<p className="x-seed subtitle has-text-black">{seed}</p>
									<p><strong>{__('Anyone with this seed can recover your account. Do not mishandle it.')}</strong></p>
									<p>{__('Use this seed for exporting/importing your D-Chat account between devices.')}</p>
								</div>
							</div>
						) : (
							<WalletPasswordVerifier
								onSuccess={wallet => setSeed(wallet.getSeed())}
								wallet={wallet}
							/>
						)}
					</div>
				</div>
				<button onClick={close} className="modal-close" aria-label={__('Close')}></button>
			</div>
		</div>
	);
};

export default WalletExporter;
