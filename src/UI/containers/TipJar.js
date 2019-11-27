import React from 'react';
import { connect } from 'react-redux';
import { newTransaction } from 'Approot/redux/actions/client';

const TipJar = ({ className = '', value, topic, addr, dispatch, messageID }) => {

	const send = (value) => {
		if ( !addr ) {
			return;
		}
		// A nice way would be to get `.then()` working, and send a regular reaction.
		// However, with the worker setup, it's not so feasible.
		dispatch(newTransaction({
			recipient: addr,
			content: '🏴‍☠️',
			targetID: messageID,
			value,
			topic,
		}));
	};

	// TODO need to i18n the data-tooltip. Should fix the placeholder feature b4 that.
	return (
		<a
			className={`button tooltip is-tooltip-left ${className}`}
			data-tooltip={`Tip ${value} sats to ${addr}.`}
			onClick={() => send(value)}
		>
			{'' + value}
		</a>
	);
};

export default connect()(TipJar);
