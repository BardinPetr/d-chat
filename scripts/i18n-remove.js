const fs = require('fs');
const path = require('path');
const targetFile = '../src/_locales/en/messages.json';

try {
	fs.unlinkSync(path.join(__dirname, targetFile));
} catch(e) {}
