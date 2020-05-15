/**
 * Man, what a mess. All the classnames mess me up.
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
	getChatURL,
	getChatDisplayName,
	isWhisperTopic,
	isPermissionedTopic,
	getTopicFromPathname,
	getWhisperRecipient,
} from 'Approot/misc/util';
import { IoIosPeople, IoMdPeople } from 'react-icons/io';
import Avatar from 'Approot/UI/containers/Avatar';

const TopicLink = ({
	topic,
	children,
	textWrapClassName = '',
	className = '',
	activeClassName = 'is-active',
	avatarClassName = 'is-32x32',
}) => (
	<NavLink
		to={getChatURL(topic)}
		className={className}
		activeClassName={activeClassName}
		isActive={() => getTopicFromPathname(location.hash) === topic}
		draggable={false}
	>
		<span className={`${textWrapClassName} is-flex x-topic-link-text-wrap`}>
			{isWhisperTopic(topic) ? (
				<Avatar
					addr={getWhisperRecipient(topic)}
					className={avatarClassName}
				/>
			) : (
				isPermissionedTopic(topic) ? (
					<span className="icon x-topic-icon"><IoMdPeople /></span>
				) : (
					<span className="icon x-topic-icon"><IoIosPeople /></span>
				)
			)}
			<span className="x-topic-name">{getChatDisplayName(topic)}</span>
			{children}
		</span>
	</NavLink>
);

export default TopicLink;
