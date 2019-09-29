// eslint-disable-next-line
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchSubscriptionInfos, subscribeToChat } from 'Approot/redux/actions';
import { DCHAT_PUBLIC_TOPICS } from 'Approot/misc/util';
import { __ } from 'Approot/misc/browser-util';
import { getChatDisplayName, getChatURL } from 'Approot/misc/util';
import Table from 'rc-table';

const defaults = {
	name: '',
	description: '',
};

const TopicInfoList = ({ dispatch, topics }) => {
	const [formData, setFormData] = useState({...defaults});
	const [status, setStatus] = useState('');
	// Maybe make the link in sidebar do this action, instead?
	// Could refresh by clicking it (not useful, though).
	useEffect(() => {
		dispatch(fetchSubscriptionInfos(DCHAT_PUBLIC_TOPICS));
	}, []);

	// User adds topic to list.
	const onSubmit = event => {
		event.preventDefault();
		dispatch(subscribeToChat(
			DCHAT_PUBLIC_TOPICS,
			formData,
		));
		setFormData({...defaults});
		setStatus(__('Submitted. It will show up soon, you will have to refresh.'));
	};

	const columns = [
		{
			title: __('Name'),
			key: 'name',
			dataIndex: 'name',
			render: value => <Link to={getChatURL(value)}>{value}</Link>,
		},
		{
			title: __('Subscribers'),
			key: 'subscribers',
			dataIndex: 'subscribers',
		},
		{
			title: __('Description'),
			key: 'description',
			dataIndex: 'description',
			colSpan: 5,
		},
	];

	const data = topics.map((topicData, index) => ({
		name: getChatDisplayName(topicData.name),
		description: topicData.description,
		subscribers: topicData.subscribersCount,
		key: index,
	}));

	return (
		<div className="section">
			<h4 className="title is-size-4">{__('List of Some Channels')}</h4>
			<Table data={data} columns={columns} className="table" />

			<form className="container" onSubmit={onSubmit}>
				<h4 className="title is-size-4">{__('Submit Your Own')}</h4>
				<div className="field">
					<p className="label">{__('Name')}</p>
					<p>{__('Channel name, like "#d-chat", for example.')}</p>
					<div className="control">
						<input
							name="name"
							value={formData.name}
							onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value})}
							className="input"
							type="text"
							required
							placeholder={__('Name')}
						/>
					</div>
				</div>
				<div className="field">
					<p className="label">{__('Description')}</p>
					<p>{__('In few words, explain what your channel is about.')}</p>
					<div className="control">
						<input
							name="description"
							value={formData.description}
							onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value})}
							className="input"
							type="text"
							placeholder={__('Keep it short.')}
						/>
					</div>
				</div>
				<p>{__('One recommended channel per address. If you have already listed a channel, it will be overwritten.')}</p>
				<div className="field">
					<div className="control">
						<button type="submit" className="button is-link">
							{__('Submit')}
						</button>
					</div>
					<p className="control">{status}</p>
				</div>
			</form>
		</div>
	);
};

const mapStateToProps = state => ({
	topics: state.chatSettings[DCHAT_PUBLIC_TOPICS].subscribersMeta || [],
});

export default connect(mapStateToProps)(TopicInfoList);
