import { connect } from 'react-redux';
import ConferencePage from './ConferencePage';
import { getWhisperRecipient, isWhisperTopic, getTopicFromPathname } from 'Approot/misc/util';
import { beginVideoSession, endVideoSession } from '../../../redux/actions';

const mapStateToProps = (state, ownProps) => {
	let topic = ownProps.match.params.topic;
	return ({
		sessions: state.sessionEvent.sessions,
		me: state.login.addr,
		topic,
		users: isWhisperTopic(topic) ? [
			getWhisperRecipient(getTopicFromPathname(location.hash)),
		] : (state.chatSettings[topic]?.subscribers || []),
	});
};


const mapDispatchToProps = dispatch => ({
	beginSession: (...p) => dispatch(beginVideoSession(...p)),
	endSession: () => dispatch(endVideoSession()),
});


export default connect(mapStateToProps, mapDispatchToProps)(ConferencePage);