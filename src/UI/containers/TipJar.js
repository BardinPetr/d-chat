import React, { useState } from 'react';
import { connect } from 'react-redux';
import { newTransaction } from 'Approot/redux/actions';

const TipJar = ({ className, addr, dispatch, topic, messageID, }) => {
	const [error, setError] = useState('');
	const [disabled, setDisabled] = useState(false);

	// React cries memory leak - doubt it.
	const send = (content, value) => {
		setError('');
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
					setError(payload.error);
				}
				setDisabled(false);
			});
	};

	let title;
	if (error) {
		title = error;
	}

	return (
		<div className={`x-tipjar buttons are-small has-addons ${className}`}>
			{[['👍', 1], ['🖤', 50], ['🏴‍☠️', 500]].map((items, idx) => (
				<a title={title || `${items[1]}sats`}
					className="button is-white"
					onClick={() => send(...items)}
					disabled={disabled}
					key={idx}
				>
					{items[0]}
				</a>
			))}
		</div>
	);
};

export default connect()(TipJar);
