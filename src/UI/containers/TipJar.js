import React, { useState } from 'react';
import { connect } from 'react-redux';
import { sendNKN } from 'Approot/redux/actions';

const TipJar = ({ addr, dispatch, topic }) => {
	const [tipped, setTip] = useState(false);
	return (
		<div className="tip-jar">
			<button disabled={tipped} type="button" className="tip-jar-button" onClick={() => {
				dispatch(sendNKN({
					to: addr,
					value: 10,
					topic
				}));
				setTip(true);
			}
			}>
				tip 10sats
			</button>
		</div>
	);
};

export default connect()(TipJar);
