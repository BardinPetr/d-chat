import React, { useState, useEffect } from 'react';
import { loadAttachment } from 'Approot/database/attachments';

const MediaMessage = ({ content, attachments, stayScrolled }) => {
	const [attaches, setAttaches] = useState([]);

	useEffect(() => {
		attachments.forEach(attachment =>
			loadAttachment(attachment)
				.then(fileInfo => {
					const blob = fileInfo.data;
					console.log(fileInfo);
					const src = URL.createObjectURL(blob);
					setAttaches([...attaches, {
						src,
						type: blob.type,
					}]);
				})
		);
	}, []);

	function revoke(attachment) {
		URL.revokeObjectURL(attachment.src);
		stayScrolled();
	}

	return (
		<div
			className="content"
		>
			{attaches.map((attach, i) => (
				<p key={i}>
					{(attach.type.includes('audio') && <audio className="x-oc-content" controls onLoadedData={() => revoke(attach)} loop src={attach.src} />)
					|| (attach.type.includes('image') && <img className="x-oc-content" onLoad={() => revoke(attach)} src={attach.src} />)
					|| (attach.type.includes('video') && <video className="x-oc-content" controls onLoadedData={() => revoke(attach)} loop src={attach.src} />)}
				</p>
			))}
			<div dangerouslySetInnerHTML={{ __html: content }} />
		</div>
	);
};

export default MediaMessage;
