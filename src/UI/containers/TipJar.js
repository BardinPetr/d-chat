import React, { useState } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { newTransaction } from 'Approot/redux/actions';

const emojis = [['👍', 1], ['🖤', 50], ['🏴‍☠️', 500]];

const TipJar = ({ topic, className, addr, dispatch, messageID, setText }) => {
	const [status, setStatus] = useState(['','','']);
	const [disabled, setDisabled] = useState(false);

	// React cries memory leak - doubt it.
	const send = (content, value, index) => {
		if ( !addr ) {
			return;
		}

		let e = status.slice();
		e[index] = '';
		setStatus(e);
		dispatch(newTransaction({
			to: addr,
			value,
			topic,
			targetID: messageID,
			contentType: 'nkn/tip',
			content,
		}))
			.then(payload => {
				if (payload.error) {
					let e = status.slice();
					// TODO make the popup not spaz out on long strings.
					e[index] = payload.error.slice(0, 12);
					setStatus(e);
				}
				setDisabled(false);
			});
	};

	return (
		<div className={`buttons are-small has-addons ${className}`}>
			{emojis.map((items, idx) => (
				<a
					className={classnames('button', {
						'is-danger': status[idx],
					})}
					onClick={() => send(...items, idx)}
					disabled={disabled}
					onMouseOver={() => setText(status[idx] || `${items[1]}sats`)}
					onMouseOut={() => setText(null)}
					key={idx}
				>
					{items[0]}
				</a>
			))}
		</div>
	);
};

export default connect()(TipJar);
