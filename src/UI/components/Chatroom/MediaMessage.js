import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { loadAttachment } from 'Approot/database/attachments';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const Attachment = ({ attachment }) => {
	const [expanded, setExpanded] = useState(false);
	const toggleExpanded = () => setExpanded(expanded => !expanded);

	return (
		<div
			className={classnames('x-media-wrapper is-flex', {
				'x-media-expanded': expanded,
			})}
			title={__('Click to expand or contract.')}
			onClick={toggleExpanded}
		>
			{(attachment.type.includes('audio') &&
				<audio
					className="x-oc-content"
					controls
					loop
					src={attachment.src}
				/>)
			|| (attachment.type.includes('image') &&
				<img
					className="x-oc-content"
					src={attachment.src}
				/>)
			|| (attachment.type.includes('video') &&
				<video
					className="x-oc-content"
					controls
					playsInline
					loop
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
