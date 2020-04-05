import React, { useState, useEffect } from 'react';
import { __, requestPermissions } from 'Approot/misc/browser-util-APP_TARGET';
import configs from 'Approot/misc/configs-APP_TARGET';
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
				<form className="form">
					<div className="field">
						<label className="label">{__('Notifications')}</label>
						<div className="control">
							<Switch
								id="notifications"
								checked={notifications}
								onChange={async e => {
									const v = e.target.checked;
									const granted = await requestPermissions([ 'notifications' ]);
									if (!granted) {
										setNotifications(false);
										configs.notifications = false;
									} else {
										setNotifications(v);
										configs.notifications = v;
									}
								}}
								name="notifications"
								className="checkbox"
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
								}}
								name="audioNotifications"
								className="checkbox"
							/>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Options;
