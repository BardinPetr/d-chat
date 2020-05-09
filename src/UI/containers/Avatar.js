import React, { useEffect } from 'react';
import useAvatar from 'Approot/UI/hooks/useAvatar';
import { connect } from 'react-redux';

const Avatar = ({ addr, className = 'is-32x32', contactEventAddr }) => {
	const { avatar, refresh } = useAvatar(addr);

	useEffect(() => {
		if (contactEventAddr === addr) {
			refresh();
		}
	}, [contactEventAddr, addr]);

	const src = avatar || 'img/no-photo.png';

	return (<img src={src} className={`x-avatar-image image ${className}`} />);
};

const mapStateToProps = state => ({
	contactEventAddr: state.contactEvent.addr,
});

export default connect(mapStateToProps)(Avatar);
