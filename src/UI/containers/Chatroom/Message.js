import { connect } from 'react-redux';
import Message from 'Approot/UI/components/Chatroom/Message';

const mapStateToProps = (state, ownProps) => ({
	mutedUsers: state.globalSettings.muted,
	subs: state.chatSettings[ownProps.message.topic]?.subscribers || [],
});

export default connect(mapStateToProps)(Message);
