import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getBalance } from 'Approot/redux/actions';
import { __ } from 'Approot/misc/util';

const NknBalance = ({ balance, dispatch }) => {
	// Similar to componentDidMount
	useEffect(() => {
		dispatch(getBalance());
	}, []);
	return (
		<span onClick={() => dispatch(getBalance())} className="balance button">
			{ balance == 0 ?
				<span>0 NKN. <a href="https://nkn-faucet.herokuapp.com/">{__('Get NKN')}</a></span>
				: balance > 0 ?
					`${balance} NKN`
					: __('Fetching balance...') }
		</span>
	);
};

const mapStateToProps = state => ({
	balance: state.nkn?.balance,
});

export default connect(mapStateToProps)(NknBalance);
