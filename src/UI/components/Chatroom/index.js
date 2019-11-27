/**
 * Contains messages list + submit box.
 *
 * Note about lazy textarea: refs will mess it up and it doesn't make that -
 * much sense in the first place.
 *
 * How in the world are callback refs supposed to be done in this?
 */
import React, { useState, useMemo, useEffect, useRef } from 'react';
import useInterval from '@rooks/use-interval';
import debounce from 'debounce';

import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { formatAddr } from 'Approot/misc/util';
import Messages from './Messages';
import Textarea from './Textarea';

const STARTING_MESSAGES_COUNT = 25;
const mention = addr => '@' + formatAddr(addr);
const quote = (addr, text) => {
	if (text) {
		// > @someone:
		// > said
		// > some
		// > thing.
		// [blank line]
		// [cursor]
		return `> ${mention(addr)}:
${text.replace(/^/mg, '> ')}

`;
	} else {
		return mention(addr);
	}
};

/**
 * Consists of existing messages and the text form.
 *
 * Marks messages read as well.
		// TODO you can't see old messages before scrollbar appears.
 */
const Chatroom = ({
	messages,
	client,
	subs,
	createMessage,
	topic,
	reactions,
	saveDraft,
	markAsRead,
	unreadMessages,
	draft,
	getSubscribers,
}) => {
	const [extraMessages, setExtraMessages] = useState(unreadMessages.length);
	const [lastReadId, setLastReadId] = useState(unreadMessages[0]);
	const getSubs = () => getSubscribers(topic);
	const { start, stop } = useInterval(getSubs, 25 * 1000);
	const textarea = useRef();
	const msg = useRef();
	// How many messages to display?
	// If count = 0: display all messages. If count = messages.length: display 0 messages.
	// By default it displays 25 messages + unread messages.
	// Scrolling up, extraMessages is incremented, displaying more messages.
	const count = useMemo(() =>
		Math.max(messages.length - STARTING_MESSAGES_COUNT - unreadMessages.length - extraMessages, 0),
	[
		topic,
		extraMessages,
	]);

	const loadMoreMessages = () => {
		setExtraMessages(extraMessages + 5);
	};

	// Also cleared on submit.
	const _saveDraft = debounce(e => saveDraft(e.target.value), 500);

	useEffect(() => {
		getSubs();
		start();
		setLastReadId(unreadMessages[0]);

		msg.current.setState({
			value: draft,
		});

		return () => {
			setExtraMessages(unreadMessages.length);
			stop();
		};
	}, [topic]);

	useEffect(() => {
		/*
		componentWillUnmount doesn't work with the popup. It dies too fast.
		Workaround: save every change.
		*/
		textarea.current.addEventListener('input', _saveDraft);

		return () => {
			textarea.current.removeEventListener('input', _saveDraft);
		};
	}, []);


	const markAllMessagesRead = () => {
		if (unreadMessages.length > 0) {
			if (unreadMessages.length < 4) {
				setLastReadId(null);
			}
			markAsRead(topic, unreadMessages);
		}
	};

	const submitText = e => {
		e.preventDefault();

		let inputValue = msg.current.state.value.trim();

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
		msg.current.setState({ value: '' });
		saveDraft('');
		textarea.current.focus();
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
	const onEnterPress = e => {
		if (e.keyCode === 13 && e.ctrlKey === false && e.shiftKey === false) {
			e.preventDefault();
			submitText(e);
			msg.current.setState({ value: '' });
		}
	};

	/**
	 * Add to textarea.
	 */
	const addToDraftMessage = text => {
		const caretPosition = msg.current.getCaretPosition();
		const currentValue = msg.current.state.value;
		const referral = text + ' ';
		// https://stackoverflow.com/questions/4364881/inserting-string-at-position-x-of-another-string
		const value = [
			currentValue.slice(0, caretPosition),
			referral,
			currentValue.slice(caretPosition),
		].join('');
		msg.current.setState({ value }, () => {
			textarea.current.focus();
			msg.current.setCaretPosition(caretPosition + referral.length);
		});
	};

	let placeholder = `${__('Message as')} ${client.addr}`;
	placeholder = `${placeholder.slice(0, 30)}...${placeholder.slice(-5)}`;

	const visibleMessages = messages.slice(count);

	return (
		<div className="x-chatroom">
			<Messages
				totalMessagesCount={messages.length}
				reactions={reactions}
				messages={visibleMessages}
				hasMore={visibleMessages.length < messages.length}
				loadMore={loadMoreMessages}
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
				innerRef={ref => (textarea.current = ref)}
				mention={mention}
				onEnterPress={onEnterPress}
				placeholder={placeholder}
				ref={ref => (msg.current = ref)}
				submitText={submitText}
				submitUpload={submitUpload}
				subs={subs}
				source={msg.current?.state?.value || ''}
				addToDraftMessage={text => addToDraftMessage(text)}
			/>
		</div>
	);
};

export default Chatroom;
