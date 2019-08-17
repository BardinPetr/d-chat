import React from 'react';
import { connect } from 'react-redux';
import ReactSidebar from 'react-sidebar';
import { toggleSidebar, dockSidebar } from 'Approot/redux/actions';
import Content from 'Approot/UI/components/Sidebar/Content';

const mql = window.matchMedia(`(min-width: 800px)`);

class Sidebar extends React.Component {
	constructor(props) {
		super(props);

		this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
		mql.addListener(this.mediaQueryChanged);
		this.mediaQueryChanged();
	}

	componentWillUnmount() {
		mql.removeListener(this.mediaQueryChanged);
	}

	mediaQueryChanged() {
		this.props.setDocked(mql.matches);
	}

	render() {
		return (
			<ReactSidebar
				open={this.props.open && !this.props.docked}
				docked={this.props.docked}
				sidebar={<Content chats={Object.keys(this.props.chats)} />}
				onSetOpen={this.props.setOpen}>
				{this.props.children}
			</ReactSidebar>
		);
	}
}

const mapStateToProps = state => ({
	open: state.sidebar.open,
	docked: state.sidebar.docked,
	chats: state.chatSettings || {},
});

const mapDispatchToProps = dispatch => ({
	setOpen: open => dispatch(toggleSidebar(open)),
	setDocked: docked => dispatch(dockSidebar(docked)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
