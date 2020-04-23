import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const Attachment = ({ attachment, onLoad }) => {
	const [expanded, setExpanded] = useState(false);
	const toggleExpanded = () => setExpanded(expanded => !expanded);

	return (
		<div
			className={classnames('x-media-wrapper', {
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
					onLoadedData={onLoad}
					src={attachment.src}
				/>)
			|| (attachment.type.includes('image') &&
				<img
					className="x-oc-content"
					src={attachment.src}
					onLoad={onLoad}
				/>)
			|| (attachment.type.includes('video') &&
				<video
					className="x-oc-content"
					controls
					playsInline
					loop
					onLoadedData={onLoad}
					src={attachment.src}
				/>)
			}
		</div>
	);
};

const MediaMessage = ({ attachments, stayScrolled }) => {
	const [attaches, setAttaches] = useState([]);

	useEffect(() => {
		attachments.forEach(blob => {
			if (!blob) {
				return;
			}
			// Old messages, bad times. TODO if message history is ever dropped, remove this.
			if (typeof blob === 'string') {
				return;
			}
			const src = URL.createObjectURL(blob);
			setAttaches([...attaches, {
				src,
				type: blob.type,
			}]);
		});

		return () => {
			attaches.forEach(({ src }) => URL.revokeObjectURL(src));
		};
	}, []);

	return (
		<div>
			<div className={'x-media-container is-flex'}>
				{attaches.map((attach, i) => (
					<div key={i}>
						<Attachment attachment={attach} onLoad={stayScrolled} />
					</div>
				))}
			</div>
		</div>
	);
};

export default MediaMessage;
