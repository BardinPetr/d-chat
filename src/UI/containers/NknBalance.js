import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getBalance } from 'Approot/redux/actions';

const NknBalance = ({ balance, dispatch }) => {
	// Similar to componentDidMount
	useEffect(() => {
		dispatch(getBalance());
	}, []);
	return (
		<span onClick={() => dispatch(getBalance())} className="has-text-grey">
			{balance} NKN
		</span>
	);
};

const mapStateToProps = state => ({
	balance: state.nkn?.balance,
});

export default connect(mapStateToProps)(NknBalance);
