import React from 'react';

const Switch = ({ onChange, checked, className = '', title = '' }) => {
	const key = Math.random();
	return (
		<>
			<input
				onChange={onChange}
				checked={checked}
				type="checkbox"
				className={`switch ${className}`}
				id={key}
			/>
			<label
				title={title}
				htmlFor={key}
			></label>
	</>
	);
};

export default Switch;
