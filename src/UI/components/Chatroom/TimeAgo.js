import React from 'react';
import TimeAgo from 'react-timeago';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const formatTime = (n, unit, ago, _, defaultFormatter) => {
	if (unit === 'second') {
		if (n < 30) {
			return `${__('< 30 s')} ${ago}`;
		} else {
			return `${__('< 1 min')} ${ago}`;
		}
	}
	return defaultFormatter();
};

const TimeSince = ({ date }) => (
	<TimeAgo
		formatter={formatTime}
		title={new Date(date).toLocaleString()}
		date={date}
		minPeriod={30}
	/>
);

export default TimeSince;
