/**
 * Contains messages list + submit box.
 *
 * Handles unread messages stuff as well.
 */
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import useInterval from '@rooks/use-interval';
import truncate from 'truncate';

import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import {
	mention,
	getChatDisplayName,
} from 'Approot/misc/util';
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
	chatType,
}) => {
	const [lastReadId, setLastReadId] = useState(unreadMessages[0]);
	const getSubs = () => getSubscribers(chatType, topic);
	const { start, stop } = useInterval(getSubs, 10 * 1000);
	const mdeInstance = useRef();
	const placeholder = useMemo(() =>
		__('Message #topic# as #user_identifier#...')
			.replace('#topic#', truncate(getChatDisplayName(topic), 8))
			.replace('#user_identifier#', client.addr.slice(0, 8))
	, [topic, client.addr]
	);

	useEffect(() => {
		const displayTopic = getChatDisplayName(topic);
		document.title = `(${unreadMessages.length}) ${displayTopic} - ${__('D-Chat')}`;

		return () => {
			document.title = __('D-Chat');
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
			topic,
		};

		createMessage(chatType, message);
	}, [topic, chatType]);

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
		createMessage(chatType, message);
		cm.setValue('');
	}, [topic, chatType]);

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
		createMessage(chatType, {
			...msg,
			topic,
			contentType: 'reaction',
		});
	}, [topic, chatType]);

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
				subs={subs}
				lastReadId={lastReadId}
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
