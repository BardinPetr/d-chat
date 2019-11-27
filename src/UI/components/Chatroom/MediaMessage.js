import React, { useState, useEffect } from 'react';
import { loadAttachment } from 'Approot/database/attachments';

const MediaMessage = ({ content, attachments }) => {
	const [attaches, setAttaches] = useState([]);
	const displayContent = content.includes('blob:') ? '' : content;

	useEffect(() => {
		attachments.forEach(attachment =>
			loadAttachment(attachment)
				.then(fileInfo => {
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

	// TODO: multiple media elements and stayScroll is bugged -
	// because only one x-media-container right now.
	return (
		<div
			className="content"
		>
			<div className="x-media-container">
				{attaches.map((attach, i) => (
					<p key={i}>
						{(attach.type.includes('audio') &&
							<audio
								className="x-oc-content"
								controls
								loop
								src={attach.src}
							/>)
						|| (attach.type.includes('image') &&
							<img
								className="x-oc-content"
								src={attach.src}
								decoding="sync"
							/>)
						|| (attach.type.includes('video') &&
							<video
								className="x-oc-content"
								controls
								playsInline
								loop
								src={attach.src}
							/>)}
					</p>
				))}
			</div>
			<div dangerouslySetInnerHTML={{ __html: displayContent }} />
		</div>
	);
};

export default MediaMessage;