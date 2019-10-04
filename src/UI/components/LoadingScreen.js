import React from 'react';
import NknLoading from 'Approot/UI/components/NknLoading';
import { __, reload } from 'Approot/misc/browser-util-APP_TARGET';
import { IS_EXTENSION } from 'Approot/misc/util';
import { HTTPSInfo } from 'Approot/UI/components/Info-APP_TARGET';

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
								) : (<HTTPSInfo />)
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
