/**
 * Contains the buttons that appear on level with username, when message is hovered.
 */

import React, { useState } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { getWhisperURL } from 'Approot/misc/util';
import { isPermissionedTopic } from 'nkn-permissioned-pubsub';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import TipJar from 'Approot/UI/containers/TipJar';
import AdminActsOn from 'Approot/UI/containers/Admin';
import { IoMdChatboxes, IoIosArrowDropdown } from 'react-icons/io';

const Toolbar = ({ id, topic, addr }) => {
	const [open, setOpen] = useState(false);
	const openModal = () => setOpen(true);
	const close = () => setOpen(false);
	const key = 'dropdown-' + id;

	return (
		<div className="x-toolbar-content x-is-padding-left">
			<div className={classnames('dropdown x-toolbar-buttons', {
				'is-active': open,
			})}>
				<div className="dropdown-trigger">
					<a
						className="button is-text is-small"
						aria-haspopup="true"
						aria-controls={key}
						onClick={openModal}
					>
						<span className="icon is-size-6" aria-hidden="true">
							<IoIosArrowDropdown aria-label={__('Open')} />
						</span>
					</a>
					<div className="dropdown-menu" id={key} role="menu">
						<div className="x-background" onClick={close}></div>
						<div className="dropdown-content">
							<TipJar
								messageID={id}
								topic={topic}
								addr={addr}
								value={5}
								className="dropdown-item"
							/>
							<Link
								to={getWhisperURL(addr)}
								className="dropdown-item"
							>
								<span className="icon">
									<IoMdChatboxes />
								</span>
								<span>{__('Start a private conversation')}</span>
							</Link>
							{isPermissionedTopic(topic) && (
								<>
									<hr className="dropdown-divider" />
									<div className="dropdown-item x-toolbar-admin x-is-padding-left">
										<AdminActsOn
											addr={addr}
											topic={topic}
										>
										</AdminActsOn>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Toolbar;
