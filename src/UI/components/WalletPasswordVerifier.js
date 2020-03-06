import React, { useState } from 'react';
import { Wallet } from 'nkn-sdk';
import classnames from 'classnames';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const WalletPasswordVerifier = ({ wallet, onSuccess }) => {
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	return (
		<div className="form">
			<div className="field">
				<div className="control">
					<label className="label">
						{__('Password')}
						<span className={classnames('x-is-transparent help is-danger is-inline x-visibility', {
							'x-has-opacity-1': !error,
						})}>{error}</span>
					</label>
					<input placeholder={__('Password')} type="text" className="input text" onChange={e => setPassword(e.target.value)} value={password} />
				</div>
			</div>
			<div className="field">
				<div className="control">
					<a className="button" onClick={() => {
						setError('');
						try {
							const loadedWallet = Wallet.fromJSON(JSON.stringify(wallet), password);
							onSuccess(loadedWallet);
						} catch(e) {
							setTimeout(() => setError('Wrong password.'), 0);
						}
					}}
					>
						{__('Show secret seed')}
					</a>
				</div>
			</div>
		</div>
	);
};

export default WalletPasswordVerifier;
