import React from 'react';

const NknLoading = ({white, black}) => (
	(white ?
		<img src="img/white-animatedlogo-fixed.gif" />
		: black ?
			<img src="img/black-animatedlogo.gif" />
			:
			<img src="img/trans-animatedlogo.gif" />
	)
);

export default NknLoading;
