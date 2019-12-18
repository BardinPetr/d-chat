/**
 * Contains messages list + submit box.
 *
 * Note about lazy textarea: refs will mess it up and it doesn't make that -
 * much sense in the first place.
 */
import React, { useState, useEffect, useRef } from 'react';
import useInterval from '@rooks/use-interval';

import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { mention, getChatDisplayName } from 'Approot/misc/util';
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

/**
 * Consists of existing messages and the text form.
 *
 * Marks messages read as well.
 */
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
	const { start, stop } = useInterval(getSubs, 25 * 1000);
	const mdeInstance = useRef();
	const [placeholder] = useState(
		`${__('Message as')} ${client.addr}`.slice(0, 30) + '...' + client.addr?.slice(-5)
	);

	useEffect(() => {
		const displayTopic = getChatDisplayName(topic).slice(0, 8);
		document.title = `(${unreadMessages.length}) ${displayTopic} - D-Chat`;
	}, [unreadMessages.length, topic]);

	useEffect(() => {
		getSubs();
		start();
		setLastReadId(unreadMessages[0]);

		return () => {
			stop();
		};
	}, [topic]);

	const markAllMessagesRead = () => {
		if (unreadMessages.length > 0) {
			if (unreadMessages.length < 4) {
				setLastReadId(null);
			}
			markAsRead(topic, unreadMessages);
		}
	};

	const submitText = (inputValue) => {
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
	};

	const submitUpload = data => {
		if (!/^(data:video|data:audio|data:image)/.test(data)) {
			return;
		}
		const content = `![](${data})`;
		const message = {
			content: content,
			contentType: 'media',
			topic,
		};
		createMessage(message);
	};

	/**
	 * Makes enter submit, shift enter insert newline.
	 */
	const onEnterPress = cm => {
		submitText(cm.getValue());
		cm.setValue('');
	};

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

	return (
		<div className="x-chatroom">
			<Messages
				topic={topic}
				refer={(addr, text) => addToDraftMessage(
					quote(
						addr,
						text
					)
				)}
				lastReadId={lastReadId}
				subs={subs}
				markAllMessagesRead={markAllMessagesRead}
				myAddr={client.addr}
				createReaction={msg =>
					createMessage({
						...msg,
						contentType: 'reaction',
						topic,
					})
				}
			/>

			<Textarea
				onEnterPress={onEnterPress}
				mdeInstance={mdeInstance}
				placeholder={placeholder}
				submitUpload={submitUpload}
				subs={subs}
			/>

		</div>
	);
};

export default Chatroom;
