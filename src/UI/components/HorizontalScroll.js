import React, { useRef } from 'react';
// import debounce from 'debounce';

const HorizontalScroll = ({ className, children = '' }) => {
	const ref = useRef();
	// const run = debounce
	const onScroll = (e) => {
		ref.current.scrollLeft += e.deltaY * 3;
	};
	return (
		<div onWheel={onScroll} ref={ref} className={`x-horizontal-scroll ${className}`}>
			{children}
		</div>
	);
};

export default HorizontalScroll;
