/**
 * Contains messages list + submit box.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import useInterval from '@rooks/use-interval';
import truncate from 'truncate';

import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { mention, getChatDisplayName, formatAddr } from 'Approot/misc/util';
import Messages from 'Approot/UI/containers/Chatroom/Messages';
import Textarea from 'Approot/UI/components/Chatroom/Textarea';

const quote = (addr, text) => {
	if (text) {
		/*
			> @someone:
			> said
			> some
			> thing.
			[blank line]
			[cursor]
		*/
		return `> ${mention(addr)}:
${text.replace(/^/mg, '> ')}

`;
	} else {
		return mention(addr) + ' ';
	}
};

const Chatroom = ({
	client,
	subs,
	createMessage,
	topic,
	markAsRead,
	unreadMessages,
	getSubscribers,
}) => {
	const [lastReadId, setLastReadId] = useState(unreadMessages[0]);
	const getSubs = () => getSubscribers(topic);
	const { start, stop } = useInterval(getSubs, 10 * 1000);
	const mdeInstance = useRef();
	const [placeholder] = useState(
		__('Message #topic# as #user_identifier#...')
			.replace('#topic#', truncate(getChatDisplayName(topic), 8))
			.replace('#user_identifier#', formatAddr(client.addr))
	);

	useEffect(() => {
		const displayTopic = getChatDisplayName(topic);
		document.title = `(${unreadMessages.length}) ${displayTopic} - D-Chat`;

		return () => {
			document.title = 'D-Chat';
		};
	}, [unreadMessages.length, topic]);

	useEffect(() => {
		getSubs();
		start();
		setLastReadId(unreadMessages[0]);

		return () => {
			stop();
		};
	}, [topic]);

	const markAllMessagesRead = useCallback(() => {
		if (unreadMessages.length > 0) {
			if (unreadMessages.length < 4) {
				setLastReadId(null);
			}
			markAsRead(topic, unreadMessages);
		}
	}, [topic, unreadMessages]);

	const submitText = useCallback((inputValue) => {
		inputValue = inputValue.trim();

		if (inputValue === '') {
			return;
		}

		const message = {
			content: inputValue,
			contentType: 'text',
			// About transmitting the hashed topic: that will make UI between different apps bad.
			// One app will get messages to "topichash" and have "hash -> topic clearname" -
			// map internally, -
			// but other apps will not have the mapping, and so it will break interop.
			topic,
		};

		createMessage(message);
	}, [topic]);

	const submitUpload = useCallback(() => {
		const cm = mdeInstance.current?.codemirror;
		if (!cm) {
			return;
		}
		const data = cm.getValue();
		if (!/(data:video|data:audio|data:image)/.test(data)) {
			return;
		}
		const content = data.trim();
		if (!content) {
			return;
		}
		const message = {
			content: content,
			contentType: 'media',
			topic,
		};
		createMessage(message);
		cm.setValue('');
	}, [topic]);

	/**
	 * Add to textarea.
	 */
	const addToDraftMessage = text => {
		const cm = mdeInstance.current?.codemirror;
		if (!cm) {
			return;
		}
		cm.replaceSelection(text);
		cm.focus();
	};

	const createReaction = useCallback(msg => {
		createMessage({
			...msg,
			topic,
			contentType: 'reaction',
		});
	}, [topic]);

	const refer = (addr, text) =>
		addToDraftMessage(quote(
			addr,
			text
		));

	return (
		<div className="x-chatroom">
			<Messages
				topic={topic}
				refer={refer}
				lastReadId={lastReadId}
				subs={subs}
				markAllMessagesRead={markAllMessagesRead}
				myAddr={client.addr}
				createReaction={createReaction}
			/>

			<Textarea
				submitText={submitText}
				mdeInstance={mdeInstance}
				placeholder={placeholder}
				submitUpload={submitUpload}
				subs={subs}
				topic={topic}
			/>

		</div>
	);
};

export default Chatroom;
