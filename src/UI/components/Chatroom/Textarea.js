import React, { useState, forwardRef, lazy, Suspense } from 'react';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import classnames from 'classnames';
import TextareaAutosize from 'react-textarea-autosize';
import TextareaAutoCompleter from './TextareaAutoCompleter';
import Uploader from './Uploader';
import { IoMdHappy, IoMdPaperPlane } from 'react-icons/io';

const LazyEmojiPicker = lazy(() => import('Approot/UI/components/Chatroom/EmojiPicker'));
const LazyMarkdown = lazy(() => import('./Markdown'));

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
							<Suspense fallback={<div className="loader" />}>
								<LazyMarkdown source={source} className="x-white-space" />
							</Suspense>
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

							<Uploader
								className="button is-text level-item is-size-7"
								onUploaded={submitUpload}
							>
								{__('Upload')}
							</Uploader>

							<a
								className="level-item button is-white has-text-grey-dark is-hidden-mobile"
								onClick={() => {
									setEmojiPickerVisible(!emojiPickerVisible);
								}}
							>
								<span className="icon is-small">
									<IoMdHappy />
								</span>
							</a>
							{emojiPickerVisible && (
								<Suspense fallback={<div className="loader" />}>
									<LazyEmojiPicker
										onSelect={emoji => {
											addToDraftMessage(emoji.native);
											setEmojiPickerVisible(false);
										}}
										visible={emojiPickerVisible}
										setVisible={setEmojiPickerVisible}
									/>
								</Suspense>
							)}

							<button type="submit" className="button is-small level-item is-hidden-desktop">
								<span className="icon">
									<IoMdPaperPlane className="is-size-5" />
								</span>
							</button>
						</div>
					</div>
				</div>
			</form>
		);
	},
);

export default Textarea;
