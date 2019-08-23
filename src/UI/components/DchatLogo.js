import React from 'react';

const DchatLogo = ({ white }) => (
	<div>
		{ white ?
			<img src="img/NKN_D-chat_white-64cropped.png" />
			:
			<img src="img/logo-blue-border.png" />
		}
	</div>
);

export default DchatLogo;
