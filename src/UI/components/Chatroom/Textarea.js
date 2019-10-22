import React, { useState, forwardRef } from 'react';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import classnames from 'classnames';
import Markdown from './Markdown';
import TextareaAutosize from 'react-textarea-autosize';
import TextareaAutoCompleter from './TextareaAutoCompleter';
import Uploader from './Uploader';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import { IoMdHappy } from 'react-icons/io';

const Textarea = forwardRef(
	(
		{
			addToDraftMessage,
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
		const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
		return (
			<form className="card" onSubmit={e => submitText(e)}>
				<div className="card-content x-is-padded-sides">
					<div
						className={classnames('control')}
						onClick={() => setEmojiPickerVisible(false)}
					>
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
							<Markdown source={source} className="x-white-space" />
						)}
					</div>

					<div className="level is-mobile">
						<div className="level-left">
							<div className="level-item tabs is-small x-tabs-has-bigger-border">
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
							{children && (
								<div className="level-item is-hidden-mobile">{children}</div>
							)}

							<a
								className="level-item button is-white has-text-grey-dark"
								onClick={() => {
									setEmojiPickerVisible(!emojiPickerVisible);
								}}
							>
								<span className="icon is-small">
									<IoMdHappy />
								</span>
							</a>
							{emojiPickerVisible && (
								<div className="x-emoji-mart-container">
									<Picker
										autoFocus
										title={__('Emojis')}
										native={true}
										backgroundImageFn={() => {}}
										onSelect={emoji => {
											addToDraftMessage(emoji.native);
											setEmojiPickerVisible(false);
										}}
										emoji="droplet"
									/>
								</div>
							)}

							<Uploader
								className="button is-text level-item is-size-7"
								onUploaded={submitUpload}
							>
								{__('Upload')}
							</Uploader>
						</div>
					</div>
				</div>
			</form>
		);
	},
);

export default Textarea;
