import React, { useState } from 'react';
import classnames from 'classnames';
import { IoMdArrowDropleftCircle, IoMdArrowDropdownCircle } from 'react-icons/io';
import TopicLink from 'Approot/UI/components/TopicLink';
import { __ } from 'Approot/misc/util';

const Info = () => {
	const [active, setActive] = useState(false);
	return (
		<div className="container">
			<p className="field">
				{ __('Joining a channel means making a transaction on the blockchain, which takes a bit of time. Though usually less than 60 seconds, it varies depending on which block your subscription transaction gets into.') }
			</p>
			<p className="field">
				<i>{ __('You can send messages before subscriptions complete, but you will not receive them until your subscription is confirmed.') }</i>
				{__('This only applies to messages in #topics. Private messages are different; no subscription required. Private messaging not yet implemented.')}
			</p>
			<p className="field">
				<strong>{__('You will need some NKN coins to join channels successfully!')}</strong>
				{' '}{__('You can get some from the faucet below.')}
			</p>
			<div className="field">
				<a className="button is-primary is-outlined" onClick={() => setActive(!active)}>
					<span>{__('Get some NKN for free')}</span>
					<span className="icon is-small">
						{ active ?
							<IoMdArrowDropdownCircle />
							:
							<IoMdArrowDropleftCircle />
						}
					</span>
				</a>
				<div className="field-body">
					<div className={classnames('box', {
						'is-hidden': !active
					})}>
						{/* Don't load if not expanded */}
						{ active && <iframe scrolling="no" style={{ width: '400px', height: '600px', }} src="https://nkn-faucet.herokuapp.com" />
						}
					</div>
				</div>
			</div>
			<p className="field" style={{wordBreak: 'keep-all'}}>
				{__('Now, regardless of coins, join channel')}
				{' '}<TopicLink topic="d-chat" />{' '}
				{__('and say hi! Someone will tip you coins.')}
			</p>
		</div>
	);
};

export default Info;
