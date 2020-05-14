/**
 * React hook for contact avatar.
 */
import { useState, useEffect, useCallback } from 'react';
import { getContact } from 'Approot/database/contacts';

const cache = {};

const getAvatar = addr => getContact(addr).then(
	contact => contact?.content?.avatar?.data
).then(data => (data instanceof Blob) ? URL.createObjectURL(data) : undefined);

/**
 * Loads avatars into cache from db, so they
 * don't have to be looked up for each message separately.
 *
 * @param string addr NKN addr.
 * @return { avatar, refresh } Avatar image src url, refresh method to reload.
 */
const useAvatar = (addr) => {
	const [avatar, setAvatar] = useState(null);
	const refresh = useCallback(() => {
		const av = getAvatar(addr);
		cache[addr] = av;
		cache[addr].then(setAvatar);
	}, [addr]);

	useEffect(() => {
		if (!addr) {
			return;
		}
		let mounted = true;

		if (!cache[addr]) {
			cache[addr] = getAvatar(addr);
		}
		cache[addr].then(av => {
			if (mounted) {
				setAvatar(av);
			}
		});

		return () => {
			mounted = false;
		};
	}, []);

	return { avatar, refresh };
};

export default useAvatar;
