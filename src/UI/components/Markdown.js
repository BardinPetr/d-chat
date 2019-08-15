import React from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const Markdown = ({source}) => (
	<ReactMarkdown
		source={source}
		escapeHtml={true}
		renderers={{code: CodeBlock}}
	/>
);

export default Markdown;
