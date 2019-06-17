/* eslint-disable no-undef */
console.log('Background.js file loaded');

/* const defaultUninstallURL = () => {
  return process.env.NODE_ENV === 'production'
    ? 'https://wwww.github.com/kryptokinght'
    : '';
}; */
browser.runtime.onInstalled.addListener(() => browser.tabs.create({
	url: browser.runtime.getURL('popup.html')
}));

browser.runtime.onMessage.addListener(function (message) {
	console.log(message);
});

