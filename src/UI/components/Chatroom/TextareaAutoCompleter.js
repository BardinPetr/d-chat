import React, { forwardRef } from 'react';
import Autocomplete from '@webscopeio/react-textarea-autocomplete';
import '@webscopeio/react-textarea-autocomplete/style.css';
import { emojiIndex } from 'emoji-mart';
import { formatAddr } from 'Approot/misc/util';

const AutofillEmojiItem = ({ entity: { id, native } }) => (
	<div>{`${id}: ${native}`}</div>
);

const AutofillMentionItem = ({ entity: { char } }) => (
	<div>{formatAddr(char)}&hellip;</div>
);

const _outputCaretEnd = item => ({ text: item.char, caretPosition: 'end' });

const TextareaAutoCompleter = forwardRef(
	({ subs, mention, ...props }, ref) => (
		<Autocomplete
			ref={ref}
			minChar={0}
			{...props}
			trigger={{
				':': {
					dataProvider: async token => emojiIndex.search(token).slice(0, 5),
					component: AutofillEmojiItem,
					output: i => _outputCaretEnd({char: i.native}),
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
	),
);

export default TextareaAutoCompleter;
