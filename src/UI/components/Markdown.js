import React from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const Markdown = ({source}) => (
	<div className="content">
		<ReactMarkdown
			source={source}
			escapeHtml={true}
			renderers={{code: CodeBlock}}
		/>
	</div>
);

export default Markdown;
