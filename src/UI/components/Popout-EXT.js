import React from 'react';
import { runtime, tabs, windows } from 'webextension-polyfill';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const popout = type => {
	const openPage = 'index.html' + location.hash;
	switch (type) {
		case 'panel':
			windows.create({
				url: runtime.getURL(openPage),
				type: 'popup',
				height: 700,
				width: 550,
			});
			break;

		case 'tab':
			tabs.create({
				url: runtime.getURL(openPage),
			});
			break;
	}
};

const Popout = () => (
	<React.Fragment>
		<p className="menu-label">{__('New View')}</p>
		<ul className="menu-list">
			<li onClick={() => popout('panel')} key="1">
				<a>{__('Panel')}</a>
			</li>
			<li onClick={() => popout('tab')} key="2">
				<a>{__('Tab')}</a>
			</li>
		</ul>
	</React.Fragment>
);

export default Popout;
