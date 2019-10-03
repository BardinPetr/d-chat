import React from 'react';
import NknLoading from 'Approot/UI/components/NknLoading';
import { __, reload } from 'Approot/misc/browser-util-APP_TARGET';
import { IS_EXTENSION } from 'Approot/misc/util';

const LoadingScreen = ({ loading, children }) => (
	loading ?
		(
			<div className="hero">
				<div className="hero-body">
					<div className="columns is-centered">
						<div className="column is-half">
							<div className="notification is-white">
								<figure className="image container is-64x64">
									<NknLoading trans />
								</figure>
								<p className="subtitle has-text-centered">
									{ __('Connecting to the blockchain...') }
								</p>
								{IS_EXTENSION ? (
									<div className="field">
										<button className="button is-text" type="button" onClick={() => reload()}>
											{__('Reload')}
										</button>
									</div>
								) : (
									(window.location.protocol !== 'http:') &&
									<div className="content">
										<p>{__('HTTPS is centralized, and this app might not work on it because of mixed content restrictions. You should connect to HTTP version of this site, instead.')}</p>
										<p>{__('Your messages will be encrypted, anyways.')}</p>
										<p>{__('If you are using HTTPS Everywhere, you can disable it on this site via the browser action.')}</p>
									</div>
								)
								}
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
