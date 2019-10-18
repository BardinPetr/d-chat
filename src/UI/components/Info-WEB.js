import React from 'react';
import TopicLink from 'Approot/UI/components/TopicLink';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

export const HTTPSInfo = () => (
	(window.location.protocol !== 'http:') &&
	<div className="content">
		<p>{__('HTTPS is centralized, and this app might not work on it because of mixed content restrictions. You should connect to HTTP version of this site, instead.')}</p>
		<p>{__('Your messages will be encrypted, anyways.')}</p>
		<p>{__('If you are using HTTPS Everywhere, you can disable it on this site via the browser action.')}</p>
		<p>{__('Clear your browser cache if you keep getting redirected.')}</p>
	</div>
);

// TODO Gotta fix the i18n script to allow placeholders.
const Info = () => {
	return (
		<div className="container">
			<p className="field" style={{wordBreak: 'keep-all'}}>
				{__('Join channel')}
				{' '}<TopicLink topic="d-chat" />{' '}
				{__('and say hi!')}
			</p>
			<div className="content">
				<p>{__('D-Chat is also a browser extension.')}</p>
				<div className="level">
					<div className="level-left">
						<a className="level-item" target="_blank" href="https://addons.mozilla.org/en-US/firefox/addon/d-chat/">
							<img src="img/AMO-button_1.png" alt={__('Get the add-on for Firefox')} />
						</a>
						<a className="level-item button is-text is-white is-hovered is-outlined has-text-dark" title={__('For Chromium based browsers, Chrome webstore')} target="_blank" href="https://chrome.google.com/webstore/detail/d-chat/glnmkakdjcognfgonjfcklpmjiobijii">
							{__('Get the add-on for Chrome')}
						</a>
					</div>
				</div>
			</div>
			<div className="content">
				<p>{__('Source code on GitLab.')} <a href="https://gitlab.com/losnappas/d-chat">https://gitlab.com/losnappas/d-chat</a></p>
			</div>
		</div>
	);
};

export default Info;
