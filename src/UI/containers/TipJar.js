import React from 'react';
import { connect } from 'react-redux';
import { newTransaction } from 'Approot/redux/actions';
import history from 'Approot/UI/history';
import { matchPath } from 'react-router-dom';
import { IoLogoBitcoin } from 'react-icons/io';
import { __ } from 'Approot/misc/browser-util';

const TipJar = ({ topic, addr, dispatch, messageID }) => {

	// React cries memory leak - doubt it.
	const send = (value) => {
		if ( !addr ) {
			return;
		}
		const whisper = matchPath(history.location.pathname, {
			path: '/whisper/:topic',
		})?.url;

		dispatch(newTransaction({
			to: addr,
			content: '',
			value,
			topic: whisper ? whisper : topic,
			targetID: messageID,
			contentType: 'nkn/tip',
		}));
	};

	return (
		<a
			className="button tooltip is-tooltip-left"
			data-tooltip={__('Tip 50 sats')}
			onClick={() => send(50)}
		>
			<span className="icon is-small"><IoLogoBitcoin /></span>
		</a>
	);
};

export default connect()(TipJar);
