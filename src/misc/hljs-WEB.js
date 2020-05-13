/**
 * In web version, we dont' want everything...
 */
import highlight from 'highlight.js/lib/core';

import javascript from 'highlight.js/lib/languages/javascript';
highlight.registerLanguage('javascript', javascript);

import python from 'highlight.js/lib/languages/python';
highlight.registerLanguage('python', python);

import go from 'highlight.js/lib/languages/go';
highlight.registerLanguage('go', go);

import rust from 'highlight.js/lib/languages/rust';
highlight.registerLanguage('rust', rust);

export default highlight;
