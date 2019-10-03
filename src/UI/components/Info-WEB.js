import React from 'react';
import TopicLink from 'Approot/UI/components/TopicLink';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

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
				<p>{__('If you care about you wallet, then export it from the accounts tab. It will be encrypted with the password that you used for login.')}</p>
			</div>
			<div className="content">
				<p>{__('Source code on GitLab.')} <a href="https://gitlab.com/losnappas/d-chat">https://gitlab.com/losnappas/d-chat</a></p>
			</div>
		</div>
	);
};

export default Info;
