import React, { useState, forwardRef } from 'react';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import classnames from 'classnames';
import Markdown from './Markdown';
import TextareaAutosize from 'react-textarea-autosize';
import TextareaAutoCompleter from './TextareaAutoCompleter';
import Uploader from './Uploader';

const Textarea = forwardRef(
	(
		{
			children,
			innerRef,
			mention,
			onEnterPress,
			placeholder,
			submitText,
			submitUpload,
			subs,
			source,
		},
		ref,
	) => {
		const [showingPreview, setShowingPreview] = useState(false);
		return (
			<form className="card" onSubmit={e => submitText(e)}>
				<div className="card-content x-is-small-padding field">
					<div className={classnames('control')}>
						<TextareaAutoCompleter
							className={classnames('textarea', {
								'is-hidden': showingPreview,
							})}
							innerRef={innerRef}
							ref={ref}
							onKeyDown={onEnterPress}
							autoFocus
							textAreaComponent={{
								component: TextareaAutosize,
								ref: 'inputRef',
							}}
							placeholder={placeholder}
							subs={subs}
							mention={mention}
						/>
						{showingPreview && (
							<Markdown
								source={source}
								className="x-white-space"
							/>
						)}
					</div>

					<div className="level is-mobile">
						<div className="level-left">
							<div className="tabs is-small x-tabs-has-bigger-border">
								<ul>
									<li
										className={classnames('', {
											'is-active': !showingPreview,
										})}
										onClick={() => setShowingPreview(false)}
									>
										<a>{__('Text')}</a>
									</li>
									<li
										className={classnames('', {
											'is-active': showingPreview,
										})}
										onClick={() => setShowingPreview(true)}
									>
										<a>{__('Preview')}</a>
									</li>
								</ul>
							</div>
						</div>

						<div className="level-right">
							{children}
							<Uploader
								className="button is-text level-item is-size-7"
								onUploaded={submitUpload}
							>
								{__('Upload')}
							</Uploader>
							<input
								type="submit"
								className="button is-small is-primary level-item"
								value={__('Submit')}
							/>
						</div>
					</div>
				</div>
			</form>
		);
	},
);

export default Textarea;
