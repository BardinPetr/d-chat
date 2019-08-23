import React, { useState } from 'react';
import { connect } from 'react-redux';
import { newTransaction } from 'Approot/redux/actions';
import { IoLogoBitcoin } from 'react-icons/io';
import classnames from 'classnames';
import { __ } from 'Approot/misc/util';

const TipJar = ({ className, addr, dispatch, topic, confirmedTransactions, unconfirmedTransactions, messageID, myAddr }) => {
	const [error, setError] = useState('');
	const [disabled, setDisabled] = useState(false);

	// React cries memory leak - doubt it.
	// But TODO go check bindActionCreators thing.
	const send = () => dispatch(newTransaction({
		to: addr,
		value: 10,
		topic,
		targetID: messageID,
		contentType: 'nkn/tip',
	}))
		.then(payload => {
			if (payload.error) {
				setError(payload.error);
			}
			setDisabled(false);
		});

	const confirmedTips = confirmedTransactions.filter(
		tx => !tx.data.isPrivate && tx.data.targetID === messageID
	);
	let title = __('Tip');
	if (error) {
		title = error;
	} else if (confirmedTips.length) {
		title = '';
		for (const tip of confirmedTips) {
			title += `${tip.data.username || __('no nick')}, `;
		}
		title = title.slice(0, -2);
		title += ` ${__('tipped.')}`;
	}

	return (
		<div className={`buttons are-small ${className}`}>
			<a
				title={title}
				className={classnames('button is-white', {
					'is-loading': unconfirmedTransactions.some(tx => tx.data.targetID === messageID),
					'is-danger': error,
					'is-success': confirmedTips.some(tx => tx.data.addr === myAddr),
				})}
				onClick={() => {
					setError(false);
					setDisabled(true);
					send();
				}}
				disabled={disabled}
			>
				<span className="icon">
					<IoLogoBitcoin />
				</span>
				{ confirmedTips.length > 0 &&
					<span>
						{confirmedTips.length}
					</span>
				}
			</a>
		</div>
	);
};

const mapStateToProps = state => ({
	confirmedTransactions: state.transactions.confirmed,
	unconfirmedTransactions: state.transactions.unconfirmed,
	myAddr: state.login?.addr,
});

export default connect(mapStateToProps)(TipJar);
