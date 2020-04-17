# Src folder

## Key technologies and packages

IndexedDB (Dexie.js), NKN (nkn-sdk), Redux (and webext-redux), React (and Babel), Web Workers, Webpack, markdown parser, html sanitizer, and webext-lib-configs.

## Message schema

Plenty of comments in [./workers/nkn/readme](./workers/nkn/README.md).

## Redux

The code jumps around a lot, because we are using redux.

The redux flow, if you don't already know, is like this:

From UI (React) we dispatch an action: `dispatch(action())`. Action is just a function that returns an object. Because this is a web-extension (a browser add-on), the action has two directions: through middlewares, either into reducer or background script (alias).

Aliases are there to give access to background-script-only functions which, in our case, include all NKN functions, since NKN is active in the background script's web worker only.

These aliased actions are in `src/redux/aliases.js`, and they mostly redirect the action into our web worker.

From web worker, another round of actions is dispatched, and these again go through middlewares, this time into the reducers, which update state, which is propagated to d-chat tabs and windows.

## About -EXT and -WEB in filenames

-EXT means the file is used for browser extension, -WEB is web version.

The web version is nice for development, since react/redux devtools don't work in web-exts.

## Folder structure

> UI, workers, misc, and redux folders are the honey.

UI: all the code for UI. Popup and sidebar both use the same code.

background: the web extension background page. Creates nkn worker.

img: some logos and other assets.

lib/js: web extension libraries: lib-configs. Lib-configs is for `browser.storage`.

misc: 
* browser-util.js: utilities that use web extension specific `browser.` functions. They have to be separated because web worker cannot use them, and importing the file throws errors in webpack. 
* configs.js: Settings stored in `browser.storage`, using lib-configs.
* util.js: Other utils.

options: options page. Largely unused.

popup & sidebar: html files that import UI.

redux: actions, middleware, aliases, reducers.

workers: NKN worker: everything in/out of NKN.
* nkn folder:
  * Incoming, outgoing, and message classes. 
  * nkn.js: nkn-client. Changing this file and nknHandler (and touch on aliases.js), one could plug in a different backend, so the code works as a chat boilerplate.

database: indexeddb, as you would expect.
