import React from 'react';

const DchatLogo = ({ white, blue }) => (
	<>
		{ white ?
			<img src="img/NKN_D-chat_white-64cropped.png" />
			: blue ?
				<img src="img/NKN_D-chat_blue-64cropped.png" />
				:
				<img src="img/logo-blue-border.png" />
		}
	</>
);

export default DchatLogo;
