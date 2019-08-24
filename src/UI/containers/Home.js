import React from 'react';
import { connect } from 'react-redux';
import NknBalance from 'Approot/UI/containers/NknBalance';
import Info from 'Approot/UI/components/Info';
import { __, getAddressFromPubKey, parseAddr } from 'Approot/misc/util';

const Home = ({ addr }) => (
	<div className="column">
		<div className="notification" style={{overflowWrap: 'anywhere'}}>
			<div className="field">
				<p className="is-size-7">{__('You are known as')}</p>
				<p>{addr}</p>
			</div>
			<div className="field">
				<p className="is-size-7">{__('Your wallet address is')}</p>
				<p style={{userSelect: 'all'}}>{getAddressFromPubKey(parseAddr(addr)[1])}</p>
			</div>
			<div className="field">
				<p className="is-size-7">{__('Your wallet balance')}</p>
				<NknBalance />
			</div>
		</div>
		<div className="section" style={{paddingTop: 0}}>
			<Info />
		</div>
	</div>
);

const mapStateToProps = state => ({
	addr: state.login?.addr,
});

export default connect(mapStateToProps)(Home);
