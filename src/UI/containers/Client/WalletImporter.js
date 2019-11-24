import React, { useState } from 'react';
import { connect } from 'react-redux';
import Uploader from 'Approot/UI/components/Uploader';
import { importWallet as importer } from 'Approot/misc/util';
import { importWallet } from 'Approot/redux/actions/client';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const WalletImporter = ({ dispatch, children }) => {
	const [importError, setImportError] = useState(null);

	return (
		<div className="field">
			{importError && <div className="help is-danger">{importError}</div>}
			<Uploader
				name="importer"
				id="importer"
				onUpload={file => {
					importer(file)
						.then(file => {
							try {
								const json = JSON.parse(file);
								dispatch(importWallet(json));
							} catch (e) {
								setImportError(__('Error: bad JSON data.'));
							}
						})
						.catch(() => setImportError('Error: pick a file.'));
				}}
			>
				{children}
			</Uploader>
		</div>
	);
};

export default connect()(WalletImporter);
