import React, { useState, useEffect } from 'react';
import { loadAttachment } from 'Approot/database/attachments';

const MediaMessage = ({ content, attachments, stayScrolled }) => {
	const [attaches, setAttaches] = useState([]);

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

	return (
		<div
			className="content"
		>
			{attaches.map((attach, i) => (
				<p key={i}>
					{(attach.type.includes('audio') &&
						<audio
							className="x-oc-content"
							controls
							onCanPlayThrough={stayScrolled}
							loop
							src={attach.src}
							onLoadedData={stayScrolled}
							onLoadedMetaData={stayScrolled}
						/>)
					|| (attach.type.includes('image') && <img className="x-oc-content" onLoad={stayScrolled} src={attach.src} />)
					|| (attach.type.includes('video') &&
						<video
							className="x-oc-content"
							controls
							playsinline
							onCanPlayThrough={stayScrolled}
							loop
							src={attach.src}
							onLoadedData={stayScrolled}
							onCanPlay={stayScrolled}
							onDurationChange={stayScrolled}
							onLoadStart={stayScrolled}
							onLoad={stayScrolled}
							onLoadedMetaData={stayScrolled}
						/>)}
				</p>
			))}
			<div dangerouslySetInnerHTML={{ __html: content }} />
		</div>
	);
};

export default MediaMessage;
