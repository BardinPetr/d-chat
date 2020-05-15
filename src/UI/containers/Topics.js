/**
 * Handles #/topics/, which is the public channels list page.
 */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchSubscriptionInfos, subscribeToChat } from 'Approot/redux/actions';
import { DCHAT_PUBLIC_TOPICS } from 'Approot/misc/util';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { getChatDisplayName } from 'Approot/misc/util';
import Table from 'rc-table';
import useInterval from '@rooks/use-interval';
import TopicLink from 'Approot/UI/components/TopicLink';

const defaults = {
	name: '',
	description: '',
};

const TopicInfoList = ({ dispatch, topics }) => {
	const [formData, setFormData] = useState({ ...defaults });
	const [status, setStatus] = useState('');
	const { start } = useInterval(() => {
		dispatch(fetchSubscriptionInfos(DCHAT_PUBLIC_TOPICS));
	}, 20000);

	// Maybe make the link in sidebar do this action, instead?
	// Could refresh by clicking it (not useful, though).
	useEffect(() => {
		dispatch(fetchSubscriptionInfos(DCHAT_PUBLIC_TOPICS));
		start();
	}, []);

	// User adds topic to list.
	const onSubmit = event => {
		event.preventDefault();
		dispatch(
			subscribeToChat(DCHAT_PUBLIC_TOPICS, {
				metadata: formData,
			}),
		);
		setFormData({ ...defaults });
		setStatus(__('Submitted. It will show up soon, usually under a minute.'));
	};

	const columns = [
		{
			title: __('Name'),
			key: 'name',
			dataIndex: 'name',
			render: value => <TopicLink topic={value} />,
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
			<div className="container">
				<div className="tile is-ancestor">
					<div className="tile is-vertical is-parent container">
						<div className="tile is-child">
							<div className="content">
								<h4 className="is-size-4 title">
									{__('List of Public Channels')}
								</h4>
								<p>
									{__('Here are channels that people have listed. You can submit your own channel to the list, so others can find you.')}
								</p>
							</div>
							<div className="table-container x-topics-table">
								<Table data={data} columns={columns} className="table"
									emptyText={(
										<div className="section">
											<div className="icon is-large loader" />
										</div>
									)}
								/>
							</div>
						</div>

						<div className="tile is-child">
							<form className="container" onSubmit={onSubmit}>
								<h4 className="title is-size-4">{__('Submit Your Own')}</h4>
								<p className="has-text-success">{status}</p>
								<div className="field">
									<p className="label">{__('Name')}</p>
									<p>{__('Channel name, like "d-chat", for example.')}</p>
									<div className="control">
										<input
											name="name"
											value={formData.name}
											onChange={e =>
												setFormData({
													...formData,
													[e.target.name]: e.target.value,
												})
											}
											className="input"
											type="text"
											required
											placeholder={__('Name')}
										/>
									</div>
								</div>
								<div className="field">
									<p className="label">{__('Description')}</p>
									<p>
										{__('In few words, explain what your channel is about.')}
									</p>
									<div className="control">
										<input
											name="description"
											value={formData.description}
											onChange={e =>
												setFormData({
													...formData,
													[e.target.name]: e.target.value,
												})
											}
											className="input"
											type="text"
											placeholder={__('Keep it short.')}
										/>
									</div>
								</div>
								<div className="field">
									<p>
										{__('One recommended channel per address. If you have already listed a channel, it will be overwritten.')}
									</p>
								</div>
								<div className="field">
									<div className="control">
										<button type="submit" className="button is-link">
											{__('Submit')}
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const mapStateToProps = state => ({
	topics: state.chatSettings[DCHAT_PUBLIC_TOPICS]?.subscribersMeta || [],
});

export default connect(mapStateToProps)(TopicInfoList);
