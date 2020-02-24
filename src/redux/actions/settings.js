export const toggleUserMute = addr => ({
	type: 'settings/TOGGLE_USER_MUTE',
	payload: {
		addr,
	},
});
