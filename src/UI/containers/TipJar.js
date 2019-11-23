import React from 'react';
import { connect } from 'react-redux';
import { newTransaction } from 'Approot/redux/actions/client';
import history from 'Approot/UI/history';
import { matchPath } from 'react-router-dom';

const TipJar = ({ className, value, topic, addr, dispatch, messageID }) => {

	const send = (value) => {
		if ( !addr ) {
			return;
		}
		const whisper = matchPath(history.location.pathname, {
			path: '/whisper/:topic',
		})?.url;

		dispatch(newTransaction({
			to: addr,
			content: `Tipped ${addr} ${value}sats.`,
			value,
			topic: whisper ? whisper : topic,
			targetID: messageID,
			contentType: 'nkn/tip',
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
