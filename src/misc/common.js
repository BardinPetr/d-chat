const audio = new Audio('img/when.ogg');
audio.volume = 0.2;
export const playNotificationSound = () => {
	audio.play();
};
