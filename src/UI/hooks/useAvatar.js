import { useState, useEffect } from 'react';
import { getContact } from 'Approot/database/contacts';

const cache = {};

const getAvatar = addr => getContact(addr).then(
	contact => contact?.content?.avatar.data
).then(data => data && URL.createObjectURL(data));

const useAvatar = (addr) => {
	const [avatar, setAvatar] = useState(null);
	const refresh = () => {
		const av = getAvatar(addr);
		cache[addr] = av;
		cache[addr].then(setAvatar);
	};

	useEffect(() => {
		if (!addr) {
			return;
		}
		let mounted = true;

		if (!cache[addr]) {
			cache[addr] = {};
			cache[addr] = getAvatar(addr);
		}
		cache[addr].then(av => {
			if (mounted) {
				setAvatar(av);
			}
		});

		return async () => {
			mounted = false;
			// No need for games. Clean out all when you change chats.
			for (const key in cache) {
				URL.revokeObjectURL(cache[key]);
				cache[key] = null;
			}
		};
	}, []);

	return { avatar, refresh };
};

export default useAvatar;
