import React, { useState, useEffect } from 'react';
import { __, requestPermissions } from 'Approot/misc/browser-util-APP_TARGET';
import configs from 'Approot/misc/configs-APP_TARGET';
import { playNotificationSound } from 'Approot/misc/common';
import Switch from 'Approot/UI/components/Switch';

const Options = () => {
	const [notifications, setNotifications] = useState(false);
	const [audioNotifications, setAudioNotifications] = useState(false);
	useEffect(() => {
		configs.$loaded.then(() => {
			setNotifications(configs.notifications);
			setAudioNotifications(configs.audioNotifications);
		});
	}, []);

	return (
		<div className="section">
			<div className="container">
				<h1 className="title">
					{__('Options')}
				</h1>
				<div className="">
					<div className="field">
						<label className="label">{__('Notifications')}</label>
						<div className="control">
							<Switch
								id="notifications"
								checked={notifications}
								onChange={async e => {
									const v = e.target.checked;
									const granted = await requestPermissions([ 'notifications' ]).catch(() => false);
									if (!granted) {
										setNotifications(false);
										configs.notifications = false;
									} else {
										setNotifications(v);
										configs.notifications = v;
									}
								}}
								name="notifications"
							/>
						</div>
					</div>
					<div className="field">
						<label className="label">{__('Audio notifications')}</label>
						<div className="control">
							<Switch
								id="audioNotifications"
								checked={audioNotifications}
								onChange={e => {
									const v = e.target.checked;
									setAudioNotifications(v);
									configs.audioNotifications = v;
									if (v) {
										// Using timeout, we set off Firefox's "autoplay disabled"
										// permission toggler.
										setTimeout(playNotificationSound, 100);
									}
								}}
								name="audioNotifications"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Options;
