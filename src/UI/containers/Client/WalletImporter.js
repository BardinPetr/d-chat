import React, { useState } from 'react';
import { connect } from 'react-redux';
import { importWallet as importer, log } from 'Approot/misc/util';
import { importWallet } from 'Approot/redux/actions/client';
import ProvideCredentials from 'Approot/UI/components/ProvideCredentials';
import history from 'Approot/UI/history';

const WalletImporter = ({dispatch}) => {
	const [importError, setImportError] = useState(null);
	const [walletJSON, setWalletJSON] = useState(null);

	return (
		<section className="section">
			<ProvideCredentials
				submit={async (credentials) => walletJSON && dispatch(importWallet({walletJSON, password: credentials.password, username: credentials.username}))}
				afterSubmit={() => history.push('/wallets')}
			>
				<div className="field">
					{ importError && <div class="help is-warning">{importError}</div>}
					<div className="control">
						<input type="file" name="importer" id="importer" className="file" onChange={(e) => {
							if (!e.target.files.length) {
								return;
							}
							importer(e.target.files[0]).then(file => {
								try {
									const json = JSON.parse(file);
									log('Importing wallet:', json);
									setWalletJSON(json);
								} catch(e) {
									setImportError('Error: bad JSON data.');
								}
							})
								.catch(() => setImportError('Error: pick a file.'));
						}} />
					</div>
				</div>
			</ProvideCredentials>
		</section>
	);
};

export default connect()(WalletImporter);
