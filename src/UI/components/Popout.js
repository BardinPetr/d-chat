import React from 'react';
import { runtime, tabs, windows } from 'webextension-polyfill';
import { __ } from 'Approot/misc/browser-util';

const popout = type => {
	switch (type) {
		case 'panel':
			windows.create({
				url: runtime.getURL('sidebar.html'),
				type: 'popup',
				height: 700,
				width: 550,
			});
			break;

		case 'tab':
			tabs.create({
				url: runtime.getURL('sidebar.html'),
			});
			break;
	}
};

const Popout = () => (
	<ul className="menu-list">
		<li onClick={() => popout('panel')} key="1">
			<a>{__('Panel')}</a>
		</li>
		<li onClick={() => popout('tab')} key="2">
			<a>{__('Tab')}</a>
		</li>
	</ul>
);

export default Popout;
