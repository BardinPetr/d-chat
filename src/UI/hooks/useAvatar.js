/**
 * React hook for contact avatar.
 */
import { useState, useEffect, useCallback } from 'react';
import { getContact } from 'Approot/database/contacts';

const getAvatar = addr => getContact(addr).then(
	contact => contact?.content?.avatar?.data
).then(data => (data instanceof Blob) ? URL.createObjectURL(data) : undefined);

/**
 * @param string addr NKN addr.
 * @return { avatar, refresh } Avatar image src url, refresh method to reload.
 */
const useAvatar = (addr) => {
	const [avatar, setAvatar] = useState(null);
	const refresh = useCallback(() => {
		const av = getAvatar(addr);
		av.then(setAvatar);
	}, [addr]);

	useEffect(() => {
		if (!addr) {
			return;
		}
		let mounted = true;
		const av = getAvatar(addr);

		av.then(a => mounted && setAvatar(a));

		return () => {
			mounted = false;
			if (avatar) {
				URL.revokeObjectURL(avatar);
			}
		};
	}, []);

	return { avatar, refresh };
};

export default useAvatar;
