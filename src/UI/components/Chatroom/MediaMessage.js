import React, { useState, useEffect, useLayoutEffect } from 'react';
import classnames from 'classnames';
import { loadAttachment } from 'Approot/database/attachments';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const Attachment = ({ attachment }) => {
	const [expanded, setExpanded] = useState(false);
	const [height, setHeight] = useState(null);
	const toggleExpanded = () => setExpanded(expanded => !expanded);

	useLayoutEffect(() => {
		window.stayScrolled();
	}, [height]);

	return (
		<div
			className={classnames('x-media-wrapper is-relative', {
				'x-media-expanded': expanded,
			})}
			title={__('Click to expand or contract.')}
			style={{
				height,
			}}
			onClick={toggleExpanded}
		>
			{(attachment.type.includes('audio') &&
				<audio
					className="x-oc-content"
					controls
					loop
					src={attachment.src}
					onLoadedData={window.stayScrolled}
					onCanPlayThrough={window.stayScrolled}
				/>)
			|| (attachment.type.includes('image') &&
				<img
					className="x-oc-content"
					src={attachment.src}
					onLoad={e => {
						// 260px is the max we have set in CSS, but if it's lower, then shrink.
						if (e.target.naturalHeight < 260) {
							setHeight(e.target.naturalHeight);
						}
						window.stayScrolled();
					}}
				/>)
			|| (attachment.type.includes('video') &&
				<video
					className="x-oc-content"
					controls
					playsInline
					loop
					onLoadedMetadata={e => {
						if (e.target.videoHeight < 260) {
							setHeight(e.target.videoHeight);
						}
						window.stayScrolled();
					}}
					onCanPlayThrough={window.stayScrolled}
					onLoadedData={window.stayScrolled}
					src={attachment.src}
				/>)
			}
		</div>
	);
};

const MediaMessage = ({ attachments }) => {
	const [attaches, setAttaches] = useState([]);

	useEffect(() => {
		attachments.forEach(attachment =>
			loadAttachment(attachment)
				.then(fileInfo => {
					if (!fileInfo) {
						return;
					}
					const blob = fileInfo.data;
					const src = URL.createObjectURL(blob);
					setAttaches([...attaches, {
						src,
						type: blob.type,
					}]);
				})
		);

		return () => {
			attaches.forEach(({ src }) => URL.revokeObjectURL(src));
		};
	}, []);

	return (
		<div>
			<div className={'x-media-container is-flex'}>
				{attaches.map((attach, i) => (
					<div key={i}>
						<Attachment attachment={attach} />
					</div>
				))}
			</div>
		</div>
	);
};

export default MediaMessage;
