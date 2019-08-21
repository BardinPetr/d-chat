import React, { useState } from 'react';
import { connect } from 'react-redux';
import { newTransaction } from 'Approot/redux/actions';
import { IoLogoBitcoin } from 'react-icons/io';
import classnames from 'classnames';
import { __ } from 'Approot/misc/util';

const TipJar = ({ addr, dispatch, topic, confirmedTransactions, unconfirmedTransactions }) => {
	const [transaction, setTransaction] = useState('');
	const [error, setError] = useState('');
	const [disabled, setDisabled] = useState(false);

	const send = () => dispatch(newTransaction({
		to: addr,
		value: 10,
		topic,
		contentType: 'nkn/tip',
	}))
		.then(payload => {
			if (payload.transactionID) {
				setTransaction(payload.transactionID);
			} else {
				setError(true);
			}
			setDisabled(false);
		});

	return (
		<div className="tip-jar buttons are-small">
			<a
				title={__('Tip')}
				className={classnames('button tip-jar-button', {
					'is-loading': unconfirmedTransactions.some(tx => tx.transactionID === transaction),
					'is-danger': error,
					'is-success': confirmedTransactions.some(tx => tx.transactionID === transaction),
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
				<span>10sats</span>
			</a>
		</div>
	);
};

const mapStateToProps = state => ({
	confirmedTransactions: state.transactions.confirmed,
	unconfirmedTransactions: state.transactions.unconfirmed,
});

export default connect(mapStateToProps)(TipJar);
