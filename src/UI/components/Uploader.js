import React from 'react';

const ImageUploader = ({className, children, onUploaded}) => {

	const upload = (e) => {
		if (e.target.files.length) {
			const reader = new FileReader();
			reader.onload = e => {
				onUploaded(e.target.result);
			};
			reader.readAsDataURL(e.target.files[0]);
		}
	};

	return (
		<label className={className}>
			<input type="file" className="is-sr-only" onChange={upload} />
			{children}
		</label>
	);
};

export default ImageUploader;
