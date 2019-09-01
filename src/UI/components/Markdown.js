import React from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const Markdown = ({source, ...props}) => (
	<div className="content">
		<ReactMarkdown
			source={source}
			escapeHtml={true}
			renderers={{code: CodeBlock}}
			{...props}
		/>
	</div>
);

export default Markdown;
