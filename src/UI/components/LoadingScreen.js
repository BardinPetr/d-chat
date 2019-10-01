import React from 'react';
import NknLoading from 'Approot/UI/components/NknLoading';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

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
