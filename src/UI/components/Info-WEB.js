import React from 'react';
import TopicLink from 'Approot/UI/components/TopicLink';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const Info = () => {
	return (
		<div className="container">
			<p className="field" style={{wordBreak: 'keep-all'}}>
				{__('Come and say hi on channel')} <TopicLink textWrapClassName="is-inline" topic="d-chat" />.
			</p>
			<div className="content">
				<p>{__('D-Chat is also a browser extension.')}</p>
				<div className="level">
					<div className="level-left">
						<a className="level-item" target="_blank" href="https://addons.mozilla.org/en-US/firefox/addon/d-chat/" rel="noopener noreferrer">
							<img src="img/AMO-button_1.png" alt={__('Get the add-on for Firefox')} />
						</a>
						<a className="level-item button is-text is-white is-hovered is-outlined has-text-dark" title={__('For Chromium based browsers, Chrome webstore')} target="_blank" href="https://chrome.google.com/webstore/detail/d-chat/glnmkakdjcognfgonjfcklpmjiobijii" rel="noopener noreferrer">
							{__('Get the add-on for Chrome')}
						</a>
					</div>
				</div>
				<p>
					{__('Using MS Edge? See instructions') + ' '}
					<a
						href="https://winaero.com/blog/install-chrome-extensions-in-microsoft-edge-chromium/"
						rel="noopener noreferrer"
						target="_blank"
						title={__('Install Chrome extensions in Edge, winaero.com')}
					>
						https://winaero.com/blog/install-chrome-extensions-in-microsoft-edge-chromium/
					</a>
				</p>
			</div>
			<div className="content">
				<p>{__('Source code on GitLab.')} <a href="https://gitlab.com/losnappas/d-chat" rel="noopener noreferrer" target="_blank">https://gitlab.com/losnappas/d-chat</a></p>
			</div>
		</div>
	);
};

export default Info;
