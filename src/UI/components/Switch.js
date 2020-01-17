import React from 'react';

const Switch = ({ onChange, className, title = '', ...props }) => {
	const key = Math.random();
	return (
		<>
			<input
				onChange={onChange}
				type="checkbox"
				className={`switch ${className}`}
				id={key}
				{...props}
			/>
			<label
				title={title}
				htmlFor={key}
			></label>
	</>
	);
};

export default Switch;
