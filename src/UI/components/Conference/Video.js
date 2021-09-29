import { useCallback } from 'react';

export const Video = ({ srcObject, ...props }) => {
	const refVideo = useCallback(
		(node) => {
			if (node) node.srcObject = srcObject;
		},
		[srcObject]
	);

	return <video ref={refVideo} {...props} />;
};
