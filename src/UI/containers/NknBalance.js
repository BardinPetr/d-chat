import React from 'react';
import { connect } from 'react-redux';
import { getBalance } from 'Approot/redux/actions';
import { __ } from 'Approot/misc/util';

const NknBalance = ({ balance, dispatch }) => (
	<div onClick={() => dispatch(getBalance())} className="balance button">
		[{ balance == 0 ?
			<span>0 NKN. <a href="https://nkn-faucet.herokuapp.com/">{__('Get NKN')}</a></span>
			: balance > 0 ?
				`${balance} NKN`
				: __('Fetch balance') }]
	</div>
);

const mapStateToProps = state => ({
	balance: state.nkn?.balance,
});

export default connect(mapStateToProps)(NknBalance);
