import React from 'react';

const ImageUploader = ({className, children, onUploaded}) => {

	const upload = (e) => {
		if (e.target.files.length) {
			const reader = new FileReader();
			reader.onload = e => {
				onUploaded(e.target.result);
			};
			if (e.target.files[0].size <= 4194304) {
				reader.readAsDataURL(e.target.files[0]);
			}
		}
	};

	return (
		<label className={className}>
			<input type="file" accept="image/*,audio/*,video/*" className="is-sr-only" onChange={upload} />
			{children} (max. 4MB)
		</label>
	);
};

export default ImageUploader;
