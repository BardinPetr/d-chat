import React from 'react';
import NknLoading from 'Approot/UI/components/NknLoading';
import { runtime } from 'webextension-polyfill';
import { __ } from '../../misc/util';

const LoadingScreen = ({ loading, children }) => (
	loading ?
		(
			<div className="hero">
				<div className="hero-body">
					<div className="columns is-centered">
						<div className="column is-half">
							<div className="notification is-light">
								<figure className="image container is-64x64">
									<NknLoading trans />
								</figure>
								<p className="subtitle has-text-centered">
									{ __('Connecting to the blockchain...') }
								</p>
								<div className="field">
									<button className="button is-text" type="button" onClick={() => runtime.reload()}>
										{__('Reload')}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		) : (
			children
		)
);

export default LoadingScreen;
