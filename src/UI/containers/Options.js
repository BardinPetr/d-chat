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
								}}
								name="audioNotifications"
							/>
						</div>
					</div>
					<div className="field">
						<label className="label">{__('Unlimited Storage space')}</label>
						<div className="control">
							<p className="is-italic">{__('This one might not do anything, depending on your browser and its version. Chrome Web Store gives a hard time over permissions, so tada.')}</p>
							<a
								onClick={() => {
									// Chromium 80 doesn't support this. Firefox doesn't support this.
									// Chrome Web Store reviewers don't want to see this as used permission.
									// What is a person to do here?
									requestPermissions([ 'unlimitedStorage' ]).catch(console.error);
								}}
								className="button"
							>{__('Request permission')}</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Options;
