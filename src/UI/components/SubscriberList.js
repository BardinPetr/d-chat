import React from 'react';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { parseAddr } from 'Approot/misc/util';

const SubscriberList = ({ subscribers }) => (
	<div>
		<p className="subtitle is-6">
			{subscribers.length} {__('people chatting')}
		</p>
		<ul className={'x-address-container content'}>
			{subscribers.sort().map((sub, key) => {
				const [username, pubKey] = parseAddr(sub);
				return (
					<li key={key} title={sub} className="x-address">
						<span className="">{username}</span>
						{username ? '.' : ''}
						<i className="is-size-7 has-text-weight-normal">
							{pubKey}
						</i>
					</li>
				);
			})}
		</ul>
	</div>
);

export default SubscriberList;
