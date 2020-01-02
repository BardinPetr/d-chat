import React, { useState, useEffect } from 'react';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import classnames from 'classnames';

const ModalOpener = ({ children, openerButtonContent, openerButtonClassName = 'button' }) => {
	const [showing, setShowing] = useState(false);
	const open = () => setShowing(true);
	const close = () => setShowing(false);

	useEffect(() => {
		document.addEventListener('keydown', close);

		return () => {
			document.removeEventListener('keydown', close);
		};
	}, []);

	return (
		<>
			<a className={openerButtonClassName} onClick={open}>
				{openerButtonContent}
			</a>
			<div className={classnames('modal', {
				'is-active': showing,
			})}>
				<div className="modal-background" onClick={close} />
				<div className="modal-content">
					<div className="box">
						<div className="section">
							{children}
						</div>
					</div>
				</div>
				<a onClick={close} className="modal-close" aria-label={__('Close')} />
			</div>
		</>
	);
};

export default ModalOpener;
