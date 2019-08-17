import React from 'react';
import { runtime } from 'webextension-polyfill';
import { __ } from '../../misc/util';

const LoadingScreen = ({ loading, children }) => (
	loading ?
		(<div className="absolute loading-description">
			<i className="loader" />
			<p>
				{ __('Connecting to blockchain...') }
			</p>
			<p className="description">
				{ __('Waited for longer than 5 seconds?') }
			</p>
			<button type="button" onClick={() => runtime.reload()}>
				{__('Reload')}
			</button>
		</div>
		) : (
			children
		)
);

export default LoadingScreen;
