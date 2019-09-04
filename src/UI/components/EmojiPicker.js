import React, { useState } from 'react';
import TipJar from '../containers/TipJar';
import Tippy from '@tippy.js/react';
import 'tippy.js/themes/light-border.css';
import classnames from 'classnames';
import { IoMdHappy } from 'react-icons/io';
import { __ } from 'Approot/misc/util';

const EmojiPicker = ({ isHidden, id, topic, addr }) => {
	const [ariaExpanded, setAriaExpanded] = useState('false');
	const [text, setText] = useState(null);

	return (
		<Tippy
			content={
				<div className="x-tippy x-emoji-picker">
					<div className="">
						{text != null ? text : __('Tip NKN')}
					</div>
					<TipJar
						className="is-inline-flex"
						messageID={id}
						topic={topic}
						addr={addr}
						setText={setText}
					/>
				</div>
			}
			interactive={true}
			arrow={true}
			aria={null}
			trigger="click"
			theme="light-border"
			onMount={() => setAriaExpanded('true')}
			onHide={() => setAriaExpanded('false')}
		>
			<a className={classnames('button tooltip is-tooltip-left',{
				'is-hidden': isHidden,
			})} data-tooltip={__('Add reaction')}>
				<span aria-expanded={ariaExpanded} className="">
					<span className="icon is-small">
						<IoMdHappy />
					</span>
				</span>
			</a>
		</Tippy>
	);
};

export default EmojiPicker;
