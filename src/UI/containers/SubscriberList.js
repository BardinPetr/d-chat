import React from 'react';
import { connect } from 'react-redux';
import { getSubscribers } from '../../redux/actions';
import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem } from 'rc-menu';
import 'rc-dropdown/assets/index.css';

const menu = subscribers => (
	<Menu selectedKeys={[]} className="subscriber-list-dropdown">
		{ subscribers.sort().map(sub =>
			<MenuItem
				className="subscriber"
				key={sub}>{String(sub)}</MenuItem>) }
	</Menu>
);

class SubscriberList extends React.Component {
	state = {
		visible: false,
	};

	onVisibleChange = visible => {
		this.setState({
			visible,
		});
		const { dispatch, topic } = this.props;
		if ( visible ) {
			dispatch(getSubscribers(topic));
		}
	}

	componentDidMount() {
		const { dispatch, topic } = this.props;
		this.interval = setInterval(
			() => dispatch(getSubscribers(topic))
			, 30 * 1000
		);
		dispatch(getSubscribers(topic));
	}

	componentWillUnmount() {
		clearInterval( this.interval );
	}

	render() {
		const { subscribers } = this.props;
		return (
			<div className="subscriber-list new no-flex join-button">
				<Dropdown
					trigger={['click']}
					overlay={() => menu(subscribers)}
					overlayClassName="subscriber-list-overlay"
					closeOnSelect={false}
					visible={this.state.visible}
					onVisibleChange={this.onVisibleChange}
				>
					<div className="subscriber-count splash">{subscribers.length}</div>
				</Dropdown>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	subscribers: state.subscribers,
	topic: state.topic,
});

export default connect(
	mapStateToProps
)(SubscriberList);
