/**
 * Dropdown element. Used in MessageActions, for example.
 */

import React, { useState } from 'react';
import classnames from 'classnames';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';

const Dropdown = ({
	closeOnClick = true,
	id,
	triggerIcon,
	isRight = false,
	isUp = false,
	children,
	triggerClassName = 'is-text'
}) => {
	const [open, setOpen] = useState(false);
	const openModal = () => setOpen(true);
	const close = () => setOpen(false);
	const key = 'dropdown-' + id;

	return (
		<div className="x-toolbar-content x-is-padding-left">
			<div className={classnames('dropdown x-toolbar-buttons', {
				'is-active': open,
				// When identifier is over 20 chars, expand the other way to avoid
				// going over chat area. 64 chars for PK.
				'is-right': isRight,
				'is-up': isUp,
			})}>
				<div className="dropdown-trigger">
					<a
						className={`button is-small ${triggerClassName}`}
						aria-haspopup="true"
						aria-controls={key}
						onClick={openModal}
					>
						<span className="icon" aria-hidden="true" aria-label={__('Open')}>
							{triggerIcon}
						</span>
					</a>
					<div className="dropdown-menu" id={key} role="menu" onClick={closeOnClick && close}>
						<div className="x-background" onClick={close}></div>
						<div className="dropdown-content">
							{children}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dropdown;
