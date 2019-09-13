import React, { useState } from 'react';
import { __ } from 'Approot/misc/util';

const ProvideCredentials = ({ noPassword, submit, afterSubmit, children, callToAction }) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(null);

	const onClick = () => {
		submit({username, password})
			.then((res) => {
				if (res.error) {
					setError(res.error);
				} else {
					afterSubmit();
				}
			});
	};

	return (
		<section className="section">
			<div className="field">
				<label className="label">
					{__('Username')}
				</label>
				<div className="control">
					<input placeholder={__('Optional')} className="input" type="text" value={username} onChange={e => setUsername(e.target.value)} />
				</div>
			</div>

			{ !noPassword &&
				<div className="field">
					<label className="label">
						{__('Password')}
						{ error && <span className="help is-danger is-inline">
							{ ' ' + error }
						</span> }
					</label>
					<div className="control">
						<input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
					</div>
				</div>
			}

			{children}

			<div className="field">
				<div className="control">
					<a className="button is-primary" onClick={onClick}>
						{callToAction || __('Submit')}
					</a>
				</div>
			</div>
		</section>
	);
};

export default ProvideCredentials;
