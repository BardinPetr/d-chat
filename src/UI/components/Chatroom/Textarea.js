import React, { lazy, Suspense, useState, useEffect } from 'react';
import { __, IS_SIDEBAR } from 'Approot/misc/browser-util-APP_TARGET';
import { mention, formatAddr } from 'Approot/misc/util';

const LazyEmojiPicker = lazy(() => import('Approot/UI/components/Chatroom/EmojiPicker'));
import { Pos } from 'codemirror';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import { emojiIndex } from 'emoji-mart';

import MarkdownEditor from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import 'font-awesome/css/font-awesome.css';

const startUpload = async (file, onUploaded, errCb) => {
	upload({ target: { files: [file] } });

	function upload(e) {
		if (e.target.files.length) {
			if (!['image/', 'video/', 'audio/'].some(f => e.target.files[0].type?.startsWith(f))) {
				errCb();
				return;
			}
			const reader = new FileReader();
			reader.onload = e => {
				onUploaded(e.target.result);
			};
			reader.onerror = e => {
				console.error('FileReader error:', e);
				errCb('Error');
			};
			if (e.target.files[0].size <= 4194304) {
				reader.readAsDataURL(e.target.files[0]);
			} else {
				errCb('Error: > 4MB');
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
						const things = subs.filter(sub => sub.startsWith(theWord)).map(sub => ({
							text: mention(sub) + ' ',
							displayText: formatAddr(sub)
						}));
						if (things.length) {
							return ({
								list: things,
								// Without this, typing 'xx @' would cause autocomplete to 'xx@something.34...' -
								// (the space is removed).
								from: theWord ? anchor : foundWord.anchor,
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

	const imageUploadFunction = (file, cb, errCb) => {
		document.querySelector('.editor-statusbar').className = 'editor-statusbar is-not-hidden';
		setTimeout(() => startUpload(file, x => {
			cb(x);
			submitUpload();
			document.querySelector('.editor-statusbar').className = 'editor-statusbar';
		}, errCb), 30);
	};

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
					uploadImage: true,
					imageUploadFunction,
					imageAccept: 'image/*,audio/*,video/*',
					imageMaxSize: 4194304, // 4MB
					status: ['upload-image'],
					toolbarTips: false,
					imageTexts: {
						sbInit: __('Post media by pasting or dropping it in the textarea.'),
						sbOnDragEnter: __('Drop media to upload.'),
						sbOnDrop: __('Uploading #images_names#.'),
						sbProgress: __('Uploading #file_name#: #progress#%.'),
						sbOnUploaded: __('Uploaded #image_name#.'),
					},
					autosave: {
						enabled: true,
						// TODO maybe manually save instead? Have to experiment.
						delay: 500,
						uniqueId: 'main-textarea',
					},
					errorCallback(err) {
						mdeInstance.current?.setStatusbar('upload-image', err);
					},
					previewClass: 'content editor-preview',
					promptURLs: IS_SIDEBAR,
					spellChecker: false,
					minHeight: 'auto',
					toolbar: ['upload-image', {
						name: 'emoji',
						action: () => setEmojiPickerVisible(true),
						className: 'fa fa-smile-o',
						title: '',
					}, '|', 'side-by-side', 'fullscreen', '|', {
						name: 'submit',
						action: editor => onEnterPress(editor.codemirror),
						className: 'fa fa-paper-plane-o',
						title: '',
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
