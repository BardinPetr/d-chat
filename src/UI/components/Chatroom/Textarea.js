import React, { lazy, Suspense, useState, useEffect } from 'react';
import classnames from 'classnames';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { mention, formatAddr, IS_SIDEBAR } from 'Approot/misc/util';
import uniq from 'lodash.uniq';

const LazyEmojiPicker = lazy(() => import('Approot/UI/components/Chatroom/EmojiPicker'));
import { Pos } from 'codemirror';

import MarkdownEditor from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

const FILESIZE_LIMIT = 2;
const FILESIZE_LIMIT_MB = FILESIZE_LIMIT * 1024 * 1024;

const startUpload = async (file, onUploaded, errCb) => {
	upload({ target: { files: [file] } });

	function upload(e) {
		if (e.target.files.length) {
			if (!['image/', 'video/', 'audio/'].some(f => e.target.files[0].type?.startsWith(f))) {
				errCb(__('Wrong filetype.'));
				return;
			}
			const reader = new FileReader();
			reader.onload = e => {
				onUploaded(e.target.result);
			};
			reader.onerror = e => {
				console.error('FileReader error:', e);
				errCb(__('Error'));
			};
			if (e.target.files[0].size <= FILESIZE_LIMIT_MB) {
				reader.readAsDataURL(e.target.files[0]);
			} else {
				errCb(
					__('Error, file is too large. Max #size# MB.').replace('#size#', FILESIZE_LIMIT)
				);
			}
		}
	}
};

/**
 * TODO: codemirror likes to initiate styles recalculations on every keypress.
 * Makes it input lag when there's a lot of DOM elements, like a 100k char message.
 *
 * Maybe put a character limit on chat messages.
 */
const Textarea = ({
	submitText,
	mdeInstance,
	placeholder,
	submitUpload,
	subs,
	topic,
}) => {
	import('codemirror/addon/hint/show-hint');
	import('codemirror/addon/hint/show-hint.css');
	const [visible, setEmojiPickerVisible] = useState(false);
	useEffect(() => {
		const cm = mdeInstance.current?.codemirror;
		if (!cm) {
			return;
		}
		// Liftman, last char of last line, please!
		cm.doc.setCursor(Infinity, Infinity);
		cm.focus();
	}, [topic]);

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
				hint: async () => {
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
						const { emojiIndex } = await import('emoji-mart');
						const filteredList = emojiIndex.search(theWord || 'smile').map(e => ({
							text: e.native,
							displayText: `${e.native} ${e.colons}`
						}));
						if (filteredList.length >= 1) {
							return {
								list: filteredList,
								from: theWord ? anchor : foundWord.anchor,
								to: Pos(line, end)
							};
						}
					} else if (word.startsWith('@')) {
						// Subs autocomplete.
						const theWord = word.slice(1);
						const things = uniq(subs.map(formatAddr)).filter(sub => sub.toLowerCase().startsWith(
							theWord.toLowerCase())
						).map(sub => ({
							text: mention(sub) + ' ',
							displayText: formatAddr(sub)
						}));
						if (things.length) {
							// Some emojis still give troubles. Something to do with unicode, probs.
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

	const onEnterPress = (cm) => {
		const mde = mdeInstance.current;
		if (!mde?.isFullscreenActive()) {
			onSubmit(mde);
		} else {
			const doc = cm.getDoc();
			const cursor = doc.getCursor(); // Gets the line number in the cursor position.
			const line = doc.getLine(cursor.line); // Get the line contents.
			const pos = { // Create a new object to avoid mutation of the original selection.
				line: cursor.line,
				ch: line.length // Set the character position to the end of the line.
			};
			doc.replaceRange('\n', pos);
		}
	};

	const setRef = i => mdeInstance.current = i;
	const onSelect = emoji => mdeInstance.current.codemirror.replaceSelection(emoji.native);

	const onSubmit = editor => {
		const cm = editor.codemirror;
		submitText(cm.getValue());
		cm.setValue('');
		localStorage['smde_main-textarea'] = '';
		cm.focus();
	};

	useEffect(() => {
		const cm = mdeInstance.current?.codemirror;
		if (!cm) {
			return;
		}
		const onDragEnter = () => {
			document.querySelector('.editor-statusbar').className = 'editor-statusbar is-not-hidden';
		};
		const onDrop = () => {
			document.querySelector('.editor-statusbar').className = 'editor-statusbar';
		};
		cm.on('dragenter', onDragEnter);
		// dragleave is worthless.
		cm.on('drop', onDrop);

		return () => {
			cm.off('dragenter', onDragEnter);
			cm.off('drop', onDrop);
		};
	}, [topic]);

	const closeEmojiPicker = () => setEmojiPickerVisible(false);

	// Without key={topic}, things go wrong. No idea how to fix that.
	return (
		<React.Fragment>
			{visible && (
				<Suspense fallback={<div className="is-hidden" />}>
					<LazyEmojiPicker
						onClose={closeEmojiPicker}
						onSelect={onSelect}
					/>
				</Suspense>
			)}
			<MarkdownEditor
				key={topic}
				id="main-textarea"
				options={{
					autofocus: true,
					placeholder,
					autoDownloadFontAwesome: false,
					uploadImage: true,
					imageUploadFunction,
					imageAccept: 'image/*,audio/*,video/*',
					imageMaxSize: FILESIZE_LIMIT_MB,
					status: ['upload-image'],
					toolbarTips: false,
					onToggleFullScreen() {
						mdeInstance.current?.codemirror.focus();
					},
					imageTexts: {
						sbInit: __('Post media by pasting or dropping it in the textarea.'),
						sbOnDragEnter: __('Drop media to upload.'),
						sbOnDrop: __('Uploading #images_names#.'),
						sbProgress: __('Uploading #file_name#: #progress#%.'),
						sbOnUploaded: __('Uploaded #image_name#.'),
					},
					autosave: {
						// Only autosave in the popup, since it is not too reliable.
						enabled: !IS_SIDEBAR,
						delay: 1500,
						uniqueId: 'main-textarea',
					},
					errorCallback(err) {
						mdeInstance.current?.setStatusbar?.('upload-image', err);
					},
					previewClass: 'content editor-preview',
					promptURLs: IS_SIDEBAR,
					spellChecker: false,
					minHeight: 'auto',
					toolbar: [
						{
							name: classnames('emoji x-fullscreen-visible', {
								'is-hidden-touch': IS_SIDEBAR
							}),
							action: () => setEmojiPickerVisible(true),
							className: 'fa fa-smile',
							title: '',
						},
						'|',
						'bold',
						'italic',
						'heading',
						'quote',
						'|',
						'link',
						'upload-image',
						'|',
						'side-by-side',
						'fullscreen',
						{
							name: classnames('submit x-fullscreen-visible is-hidden-tablet'),
							action: onSubmit,
							className: 'fa fa-paper-plane-empty',
							title: '',
						}
					]
				}}
				extraKeys={{
					Enter: onEnterPress,
					// TODO bind Shift-Enter to Enter, to improve newline mechanics.
				}}
				className="x-main-editor"
				getMdeInstance={setRef}
			/>
		</React.Fragment>
	);
};

export default Textarea;
