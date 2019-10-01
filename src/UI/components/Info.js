import React, { useState } from 'react';
import classnames from 'classnames';
import { IoMdArrowDropleftCircle, IoMdArrowDropdownCircle } from 'react-icons/io';
import TopicLink from 'Approot/UI/components/TopicLink';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const Info = () => {
	const [active, setActive] = useState(false);
	return (
		<div className="container">
			<p className="field" style={{wordBreak: 'keep-all'}}>
				{__('Join channel')}
				{' '}<TopicLink topic="d-chat" />{' '}
				{__('and say hi! Someone will tip you coins.')}
			</p>
			<div className="field">
				<a className="button is-primary is-outlined" onClick={() => setActive(!active)}>
					<span>{__('Get some NKN for free, from the faucet')}</span>
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
						{ active && <iframe scrolling="no" style={{ width: '500px', height: '600px', }} src="https://nkn-faucet.herokuapp.com" />
						}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Info;
