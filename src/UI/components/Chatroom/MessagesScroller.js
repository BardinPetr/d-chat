/**
 * Keeps chat scrolled. Marks messages as read.
 */
import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { ResizeReporter } from 'react-resize-reporter/scroll';
import InfiniteScroller from 'react-infinite-scroller';
import useStayScrolled from 'react-stay-scrolled';
import { debounce } from 'debounce';

const MessagesScroller = ({
	markAllMessagesRead,
	children,
	loadMore,
	hasMore,
	listClassname,
	scrollTriggers,
	topic,
}) => {
	const listRef = useRef();
	const { stayScrolled, isScrolled, scrollBottom } = useStayScrolled(listRef, {
		initialScroll: Infinity,
		inaccuracy: 15,
	});

	useEffect(() => {
		const onVisibilityChange = () => {
			if (!document.hidden && isScrolled()) {
				markAllMessagesRead();
			}
		};
		document.addEventListener('visibilitychange', onVisibilityChange);
		return () => {
			document.removeEventListener('visibilitychange', onVisibilityChange);
		};
	}, []);

	useLayoutEffect(() => {
		stayScrolled();

		if (isScrolled()) {
			if (!document.hidden) {
				markAllMessagesRead();
			}
		}
	}, scrollTriggers);

	// When changing topic, we want to stay bottom.
	useLayoutEffect(() => {
		scrollBottom();
	}, [topic]);

	const stay = debounce(stayScrolled, 50);

	return (
		<div
			className={listClassname}
			ref={listRef}
		>
			<ResizeReporter onSizeChanged={stay} />
			<InfiniteScroller
				pageStart={0}
				isReverse
				loadMore={loadMore}
				hasMore={hasMore}
				loader={<div className="is-loader" key={0} />}
				initialLoad={false}
				useWindow={false}
				threshold={100}
				className="x-is-fullwidth"
			>
				<React.Fragment key="it-bugs-out-without-this-key">
					{children(stayScrolled)}
				</React.Fragment>
			</InfiniteScroller>
		</div>
	);
};

export default MessagesScroller;
