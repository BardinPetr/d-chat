/**
 * The 3 vertical dots button in header.
 * Pass in children like <li>something</li>.
 */
import React, { useState, useRef } from 'react';
import { IoMdMore } from 'react-icons/io';
import Modal from 'react-modal';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

Modal.setAppElement('.dashboard');

const DotDotDot = ({ className = '', children, ...props }) => {
	const ref = useRef();
	const [expanded, setExpanded] = useState(false);

	return (
		<>
			<a
				{...props}
				ref={ref}
				className={className}
				onClick={() => setExpanded(true)}
			>
				<div className="icon">
					<IoMdMore className="is-size-3" />
				</div>
			</a>
			<Modal
				isOpen={expanded}
				onRequestClose={() => setExpanded(false)}
				contentLabel={__('Actions menu')}
				className="x-modal x-dot-dot-dot-container"
			>
				<div
					className="x-dot-dot-dot"
					style={ref.current ? {
						top: ref.current.offsetTop,
						left: ref.current.offsetLeft,
					} : {}}
				>
					<div className="menu">
						<ul className="menu-list" onClick={() => setExpanded(false)}>
							{children}
						</ul>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default DotDotDot;
