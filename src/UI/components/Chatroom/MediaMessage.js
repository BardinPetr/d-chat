import React, { useState, useEffect } from 'react';
import { loadAttachment } from 'Approot/database/attachments';

const MediaMessage = ({ content, attachments, stayScrolled }) => {
	const [attaches, setAttaches] = useState([]);
	const displayContent = content.includes('blob:') ? '' : content;

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
		<div
			className=""
		>
			<div className={'x-media-container is-flex'}>
				{attaches.map((attach, i) => (
					<p key={i}>
						{(attach.type.includes('audio') &&
							<audio
								className="x-oc-content"
								controls
								loop
								onLoadedData={stayScrolled}
								src={attach.src}
							/>)
						|| (attach.type.includes('image') &&
							<img
								className="x-oc-content"
								src={attach.src}
								onLoad={stayScrolled}
							/>)
						|| (attach.type.includes('video') &&
							<video
								className="x-oc-content"
								controls
								playsInline
								loop
								onLoadedData={stayScrolled}
								src={attach.src}
							/>)}
					</p>
				))}
			</div>
			<div className="content" dangerouslySetInnerHTML={{ __html: displayContent }} />
		</div>
	);
};

export default MediaMessage;
