import React from 'react';

const Uploader = ({ children, onUpload, ...props }) => (
	<div className="control">
		<label className="label">
			{children}
			<input
				type="file"
				{...props}
				className="file is-sr-only"
				onChange={e => {
					if (!e.target.files[0]) {
						return;
					}
					onUpload(e.target.files[0]);
				}}
			/>
		</label>
	</div>
);

export default Uploader;
