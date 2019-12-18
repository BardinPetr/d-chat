import React, { lazy, Suspense, useState, useEffect } from 'react';
import { __, IS_SIDEBAR } from 'Approot/misc/browser-util-APP_TARGET';
import { mention } from 'Approot/misc/util';

const LazyEmojiPicker = lazy(() => import('Approot/UI/components/Chatroom/EmojiPicker'));
import { Pos } from 'codemirror';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import { emojiIndex } from 'emoji-mart';

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
	subs,
}) => {
	const [visible, setEmojiPickerVisible] = useState(false);
	useEffect(() => {
		const cm = mdeInstance.current?.codemirror;
		if (!cm) {
			return;
		}
		// Liftman, last char of last line, please!
		cm.doc.setCursor(Infinity, Infinity);
	}, []);

	// Autocomplete.
	useEffect(() => {
		const cm = mdeInstance.current?.codemirror;
		if (!cm) {
			return;
		}

		// Don't mind me, codemirror api is complex, hopefully don't have to touch this again.
		const listener = () => {
			// For some reason cm does not like different listeners.
			// Subs + emoji autocomplete.
			cm.showHint({
				completeSingle: false,
				hint: () => {
					const cur = cm.getCursor();
					const end = cur.ch;
					let line = cur.line;
					const foundWord = cm.findWordAt(cur);
					const anchor = {
						...foundWord.anchor,
						ch: foundWord.anchor.ch - 1,
					};
					const word = cm.getRange(anchor, foundWord.head).trimLeft();

					if (word.startsWith(':')) {
						// Emoji autocomplete.
						const theWord = word.slice(1);
						const filteredList = emojiIndex.search(theWord || 'smile').map(e => ({
							text: e.native,
							displayText: `${e.native} ${e.colons}`
						}));
						if (filteredList.length >= 1) {
							return {
								list: filteredList,
								from: anchor,
								to: Pos(line, end)
							};
						}
					} else if (word.startsWith('@')) {
						// Subs autocomplete.
						const theWord = word.slice(1);
						const things = subs.filter(sub => sub.startsWith(theWord)).map(sub => mention(sub) + ' ');
						if (things.length) {
							return ({
								list: things,
								from: anchor,
								to: Pos(line, end),
							});
						}
					}
				},
			});
		};
		cm.on('inputRead', listener);

		return () => {
			cm.off('inputRead', listener);
		};
	}, [subs]);

	return (
		<>
			{visible &&
				<Suspense fallback={<div className="is-hidden" />}>
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
					insertTexts: {
						image: ['![](', ')']
					},
					autosave: {
						enabled: true,
						// TODO maybe manually save instead? Have to experiment.
						delay: 500,
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
