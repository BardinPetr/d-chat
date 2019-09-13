import React from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const Markdown = ({source, imagesLoaded, ...props}) => (
	<div className="content">
		<ReactMarkdown
			source={source}
			escapeHtml={true}
			renderers={{
				code: CodeBlock,
				image: (props) =>
					<img {...props} onLoad={imagesLoaded} />,
			}}
			{...props}
		/>
	</div>
);

export default Markdown;
