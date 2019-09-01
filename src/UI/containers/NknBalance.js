import React from 'react';
import { connect } from 'react-redux';

const NknBalance = ({ balance }) => {
	return (
		<span className="has-text-grey">
			{balance} NKN
		</span>
	);
};

const mapStateToProps = state => ({
	balance: state.nkn?.balance,
});

export default connect(mapStateToProps)(NknBalance);
