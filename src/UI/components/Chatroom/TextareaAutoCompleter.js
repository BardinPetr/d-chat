import React, { forwardRef } from 'react';
import classnames from 'classnames';
import Autocomplete from '@webscopeio/react-textarea-autocomplete';
import '@webscopeio/react-textarea-autocomplete/style.css';
import emoji from '@jukben/emoji-search';
import { formatAddr } from 'Approot/misc/util';
import Markdown from './Markdown';

const AutofillEmojiItem = ({ entity: { name, char } }) => (
	<div>{`${name}: ${char}`}</div>
);

const AutofillMentionItem = ({ entity: { char } }) => (
	<div>{formatAddr(char)}&hellip;</div>
);

const _outputCaretEnd = item => ({ text: item.char, caretPosition: 'end' });

const TextareaAutoCompleter = forwardRef(
	({ source, showingPreview, subs, mention, ...props }, ref) => (
		<div className="">
			<Autocomplete
				className={classnames('textarea', {
					'is-hidden': showingPreview,
				})}
				ref={ref}
				{...props}
				trigger={{
					':': {
						dataProvider: async token => emoji(token).slice(0, 5),
						component: AutofillEmojiItem,
						output: _outputCaretEnd,
					},
					// Grab matching subs, grab 5, sort, filter duplicates, map to format.
					'@': {
						dataProvider: async token =>
							subs
								.filter(sub => sub.startsWith(token))
								.slice(0, 5)
								.sort()
								.filter((i, pos, arr) => !pos || i !== arr[pos - 1])
								.map(sub => ({ char: mention(sub) + ' ' })),
						component: AutofillMentionItem,
						output: _outputCaretEnd,
					},
				}}
				loadingComponent={() => <span className="is-loader" />}
			/>
			{showingPreview && <Markdown source={source} className="x-white-space" />}
		</div>
	),
);

export default TextareaAutoCompleter;
