import React, { lazy, Suspense, useState, useEffect } from 'react';
import { __, IS_SIDEBAR } from 'Approot/misc/browser-util-APP_TARGET';

const LazyEmojiPicker = lazy(() => import('Approot/UI/components/Chatroom/EmojiPicker'));
import MarkdownEditor from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import 'font-awesome/css/font-awesome.css';

const startUpload = (onUploaded) => {
	let el = document.createElement('input');
	el.type = 'file';
	el.accept = 'image/*,audio/*,video/*';
	el.onchange = upload;
	el.click();

	function upload(e) {
		if (e.target.files.length) {
			const reader = new FileReader();
			reader.onload = e => {
				onUploaded(e.target.result);
				el = null;
			};
			if (e.target.files[0].size <= 4194304) {
				reader.readAsDataURL(e.target.files[0]);
			}
		}
	}
};

const Textarea = ({
	onEnterPress,
	mdeInstance,
	placeholder,
	submitUpload,
}) => {
	const [visible, setEmojiPickerVisible] = useState(false);
	useEffect(() => {
		const cm = mdeInstance.current?.codemirror;
		if (!cm) {
			return;
		}
		// Liftman, last char of last line, please!
		cm.doc.setCursor(9999, 9999);
	}, []);
	return (
		<>
			{visible &&
				<Suspense fallback={<div className="loader" />}>
					<LazyEmojiPicker
						visible={visible}
						setVisible={setEmojiPickerVisible}
						onSelect={emoji => mdeInstance.current.codemirror.replaceSelection(emoji.native)}
					/>
				</Suspense>
			}
			<MarkdownEditor
				id="main-textarea"
				options={{
					autofocus: true,
					placeholder,
					autoDownloadFontAwesome: false,
					autosave: {
						enabled: true,
						delay: 1000,
						uniqueId: 'main-textarea',
					},
					promptURLs: IS_SIDEBAR,
					spellChecker: false,
					status: false,
					minHeight: 'auto',
					renderingConfig: {
						codeSyntaxHighlighting: true,
					},
					toolbar: [{
						name: 'bold',
						action: editor => editor.toggleBold(),
						className: 'fa fa-bold',
						title: __('Bold'),
					}, {
						name: 'x-heading',
						action: editor => editor.toggleHeading3(),
						className: 'fa fa-header',
						title: __('Heading')
					}, '|', {
						name: 'quote',
						action: editor => editor.toggleBlockquote(),
						className: 'fa fa-quote-left',
						title: __('Quote'),
					}, {
						name: 'unordered-list',
						action: editor => editor.toggleUnorderedList(),
						className: 'fa fa-list-ul',
						title: __('Unordered list'),
					}, '|', {
						name: 'image',
						action: editor => editor.drawImage(),
						className: 'fa fa-picture-o',
						title: __('Image from URL'),
					}, {
						name: 'upload',
						action: () => startUpload(submitUpload),
						className: 'fa fa-file-picture-o',
						title: __('Upload media and post it immediately. Max 4MB'),
					}, '|', {
						name: 'fullscreen',
						action: editor => editor.toggleFullScreen(),
						className: 'fa fa-arrows-alt no-disable no-mobile',
						title: __('Toggle fullscreen'),
					}, '|', {
						name: 'emoji',
						action: () => setEmojiPickerVisible(true),
						className: 'fa fa-smile-o',
						title: __('Emoji picker'),
					}, {
						name: 'submit is-pulled-right',
						action: editor => onEnterPress(editor.codemirror),
						className: 'fa fa-paper-plane-o',
						title: __('Send'),
					}]
				}}
				extraKeys={{
					Enter: onEnterPress,
					// TODO bind Shift-Enter to Enter, to improve newline mechanics.
				}}
				className="x-main-editor"
				getMdeInstance={i => mdeInstance.current = i}
			/>
		</>
	);
};

export default Textarea;
