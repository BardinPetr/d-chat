import React from 'react';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { connect } from 'react-redux';
import { newTransaction } from 'Approot/redux/actions/client';
import { FaDollarSign } from 'react-icons/fa';

const TipJar = ({ className = '', title, value = 5, topic, recipientAddr, dispatch, messageID }) => {

	const send = () => {
		if (!recipientAddr) {
			return;
		}
		// A nice way would be to get `.then()` working, and send a regular reaction.
		// However, with the worker setup, it's not so feasible.
		dispatch(newTransaction({
			recipient: recipientAddr,
			content: '🏴‍☠️',
			targetID: messageID,
			value,
			topic,
		}));
	};

	return (
		<a
			className={className}
			title={title}
			onClick={send}
		>
			<span className="icon"><FaDollarSign /></span>
			<span>{__('Tip #value# sats').replace('#value#', value)}</span>
		</a>
	);
};

export default connect()(TipJar);
