# Src folder

## About -EXT and -WEB in filenames

-EXT means the file is used for browser extension, -WEB is web version.

## Structure

UI: all the code for UI. Popup and sidebar both use the same code.

background: the web extension background page. Creates nkn worker.

img: some logos and other assets.

lib/js: 2 web extension libraries: lib-configs & lib-options. Lib-configs is for `browser.storage`, lib-options is only used for options page.

misc: 
* browser-util.js: utilities that use web extension specific `browser.` functions. They have to be separated because web worker cannot use them, and importing the file throws errors in webpack. 
* configs.js: settings stored in `browser.storage`, using lib-configs.
* util.js: other utils.

options: options page. largely unused.

popup & sidebar: html files that import UI.

redux: actions, middleware, aliases, reducers.

workers: NKN worker: everything in/out of NKN.
* nkn folder:
  * incoming, outgoing, and BaseMessage classes. 
  * nkn.js: nkn-client. Changing this file and nknHandler (and touch on aliases.js), one could plug in a different backend, so the code works as a chat boilerplate.
  * nknHandler: keeps track of active, connected, client.
