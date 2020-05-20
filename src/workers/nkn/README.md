# Details about Messages

> Also see https://docs.nkn.org/docs/d-chat-message-scheme

* Topic is chatroom topic.
  * Omit `topic` in whispers.
* Specify a unique ID so people can react to certain messages via `targetID`.
* `timestamp` from Date.now() (ms since epoch).
* `targetID` is like "reply to message that has this ID".
* {id,topic,addr,targetID} each have max length of 128 characters.
  * That means you should set max length of NKN identifier at 63.

Example of a text message that is sent out:

```javascript
{
  contentType: 'text',
  content: 'some _markdown_ format text',
  id: '{123-321-3213-21435tr}', // uuidv4(). Do not use uuidv1, because it will create duplicates.
  // Note: D-Chat has some issues with percentage signs (%) in topic names.
  topic: 'topic name',
  // Older versions used .toUTCString(), so do take care before assuming it is integer.
  timestamp: Date.now(),
}
```

Media messages are the same except `contentType: 'media'`,
the media data is placed in markdown image tags like `![](base64datastring)`.

Reactions are `contentType: 'reaction'` and include `targetID`.

Topic is omitted in whispers, and `isPrivate: true` is added.

Whispers have field `isPrivate: true` set, so that
in the future, you can whisper to people inside a topic
and not create a new private chatroom, but just display
the message in the topic chatroom. It is not used in D-Chat for anything yet,
and is mostly optional for now.

After receiving a message that wants confirmation that it was received  (e.g. whisper),
you should send a receipt to the sender. Same as text message, except no `content`, and
`contentType` is set to `'receipt'`.

Summing up a list of contentTypes used by D-Chat:

- event:subscribe
- event:add-permission
- event:remove-permission
- media
- event:message/delete
- reaction
- receipt
- text
- contact (see the nMobile NKN.org thread linked at the bottom of this doc)

And on hiatus:

- nkn/tip
- background
- heartbeat

About the use of each contentType,

- 'event:subscribe', is used when announcing joining the chat. 
  - In D-Chat, receiving one of these triggers a "getSubscribers".
- 'receipt', is like reaction without content.
  - It is used for notifying "message received".
- 'nkn/tip': was used before but not currently. Might, however, make a comeback at some point.
- 'event:message/delete': Deletes your message by targetID.

For messages that don't want user reaction, you might use `contentType: 'background'`.
Rest of stuff is internal or old stuff, didn't have the presence of mind to underscore them.

***Do not treat messages as trusted content. See `IncomingMessage.js` for D-Chat's sanitization.***

## And One More Thing

The `topic` that you *subscribe to* should be `'dchat' + shasum(topic)`, and `topic` that you *include in messages* should just be `topic`.

That is sha1sum.

## Relevant NKN.org thread

https://forum.nkn.org/t/nmobile-message-protocol/2203
