import { connect } from 'react-redux';
import Message from 'Approot/UI/components/Chatroom/Message';

const mapStateToProps = (state) => ({
	mutedUsers: state.globalSettings.muted,
});

export default connect(mapStateToProps)(Message);
