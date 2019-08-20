import React, { useState } from 'react';
import classnames from 'classnames';
import { IoMdArrowDropleftCircle, IoMdArrowDropdownCircle } from 'react-icons/io';
import TopicLink from 'Approot/UI/components/TopicLink';
import { __ } from 'Approot/misc/util';

const Info = () => {
	const [active, setActive] = useState(false);
	return (
		<div className="column">
			<div className="section">
				<div className="container">
					<p className="field">
						{ __('Joining a channel takes time, usually less than 60 seconds. It depends on which block your subscription transaction gets into. When you "join", you are in fact "subscribing", you see.') }
					</p>
					<p className="field">
						<i>{ __('You can send messages before subscriptions complete, but you will not receive them until your subscription resolves.') }</i>
					</p>
					<p className="field">
						<strong>{__('You will need some NKN coins to join channels successfully!')}</strong>
					</p>
					<div className="field">
						<a className="button is-info is-outlined" onClick={() => setActive(!active)}>
							<span>{__('You can get some for free.')}</span>
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
								{ active && <iframe scrolling="no" style={{ width: '100%', height: '600px', }} src="https://nkn-faucet.herokuapp.com" />
								}
							</div>
						</div>
					</div>
					<p className="field">
						{__('Now, once you have some coins, join channel')}
						{' '}<TopicLink topic="d-chat" />,{' '}
						{__('and give feedback, thanks!')}
					</p>
				</div>
			</div>
		</div>
	);
};

export default Info;
