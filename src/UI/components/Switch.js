import React from 'react';

const Switch = ({
	className,
	title = '',
	id = Math.random(),
	...props
}) => {
	return (
		<>
			<input
				type="checkbox"
				className={`switch ${className}`}
				id={id}
				{...props}
			/>
			<label
				title={title}
				htmlFor={id}
			></label>
	</>
	);
};

export default Switch;
