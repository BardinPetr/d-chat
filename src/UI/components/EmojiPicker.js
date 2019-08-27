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
				<div className="">
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
			className={classnames('', {
				'is-hidden': isHidden,
			})}
			interactive={true}
			arrow={true}
			aria={null}
			trigger="click"
			theme="light-border"
			onMount={() => setAriaExpanded('true')}
			onHide={() => setAriaExpanded('false')}
		>
			<button className="x-is-hover button is-small is-white" aria-expanded={ariaExpanded}>
				<span className="icon is-small">
					<IoMdHappy />
				</span>
			</button>
		</Tippy>
	);
};

export default EmojiPicker;
