const fs = require('fs');
const targetFile = '../src/_locales/en/messages.json';
const contents = require(targetFile);
const path = require('path');

for (let key in contents) {
	const content = contents[key];
	delete contents[key];
	contents[key.replace(/[^a-zA-Z_]*/g, '')] = { message: content };
}

contents.extensionName = { message: 'D-Chat' };
contents.extensionDescription = { message: 'Decentralized chat on the NKN blockchain.' };

fs.writeFileSync(path.join(__dirname, targetFile), JSON.stringify(contents, null, 2));
