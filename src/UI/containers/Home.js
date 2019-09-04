import React, { useState } from 'react';
import { connect } from 'react-redux';
import NknBalance from 'Approot/UI/containers/NknBalance';
import Info from 'Approot/UI/components/Info';
import {
	__,
	getAddressFromPubKey,
	parseAddr,
	getChatURL,
	getWhisperURL,
} from 'Approot/misc/util';
import { runtime } from 'webextension-polyfill';
import history from 'Approot/UI/history';

const NewTopicForm = ({ privateChat }) => {
	const [target, setTarget] = useState('');
	const submit = () => {
		let t = privateChat ? getWhisperURL(target) : getChatURL(target);
		history.push(t);
		setTarget('');
	};

	return (
		<form className="field" onSubmit={submit}>
			<div className="control">
				<input placeholder={privateChat ? __('Identity') : __('Topic')} value={target} className="input is-small is-rounded" onChange={e => setTarget(e.target.value)} />
			</div>
		</form>
	);
};


const Home = ({ addr }) => (
	<div className="column">
		<div className="notification" style={{marginBottom: 0, overflowWrap: 'anywhere', wordBreak: 'break-all'}}>
			<div className="field">
				<p className="is-size-7">{__('You are known as')}</p>
				<p style={{userSelect: 'all'}}>{addr}</p>
			</div>
			<div className="field">
				<p className="is-size-7">{__('Your wallet address is')}</p>
				<p style={{userSelect: 'all'}}>{getAddressFromPubKey(parseAddr(addr)[1])}</p>
			</div>
			<div className="field">
				<p className="is-size-7">{__('Your wallet balance')}</p>
				<NknBalance />
			</div>
			<div className="field">
				<p className="is-size-7">{__('D-Chat version')}</p>
				<p>{runtime.getManifest().version}</p>
			</div>
		</div>
		<div className="section" style={{paddingTop: 0}}>
			<div className="field">
				<label className="label has-text-weight-normal">
					{__('Join a chatroom')}:
				</label>
				<div className="control">
					<NewTopicForm />
				</div>
			</div>
			<div className="field">
				<label className="label has-text-weight-normal">
					{__('Private message')}:
				</label>
				<div className="control">
					<NewTopicForm privateChat />
				</div>
			</div>
			<Info />
		</div>
	</div>
);

const mapStateToProps = state => ({
	addr: state.login?.addr,
});

export default connect(mapStateToProps)(Home);
