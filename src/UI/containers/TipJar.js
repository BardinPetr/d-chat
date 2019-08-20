import React, { useState } from 'react';
import { connect } from 'react-redux';
import { newTransaction } from 'Approot/redux/actions';
import { IoLogoBitcoin } from 'react-icons/io';
import classnames from 'classnames';
import { __ } from 'Approot/misc/util';

const TipJar = ({ addr, dispatch, topic, confirmedTransactions, unconfirmedTransactions }) => {
	const [transaction, setTransaction] = useState('');
	const [error, setError] = useState('');

	const send = () => dispatch(newTransaction({
		to: addr,
		value: 10,
		topic,
		type: 'nkn/tip',
	}))
		.then(tx => setTransaction(tx))
		.catch(() => setError(true));

	return (
		<div className="tip-jar buttons are-small">
			<a
				title={__('Tip')}
				className={classnames('button tip-jar-button', {
					'is-loading': unconfirmedTransactions.some(tx => tx.id === transaction),
					'is-danger': error,
					'is-success': confirmedTransactions.some(tx => tx.id === transaction),
				})}
				onClick={() => {
					setError(false);
					send();
				}}
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
