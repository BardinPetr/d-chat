import React, { Component } from 'react';

const UserCheck = ({isOk, children}) => (
	<div>
		{isOk ? children : 
			<div>
				<article className="message is-danger">
					<div className="message-header">
						<p>Not a member</p>
					</div>
					<div className="message-body">
					You should be subscribed to this topic to enter the conference
					</div>
				</article>
			</div>
		}
	</div>
);

const VIDEO_TYPE = 'video/webm;codecs=vp8';

export default class ConferencePage extends Component {
	constructor(props) {
		super(props);

		let channel = new MessageChannel();
		this.workerport = channel.port1;

		this.props.beginSession(channel.port2, this.props.users);
		
		this.state = {
			activeStreams: {}
		};
	}

	componentDidMount() {
		navigator.mediaDevices
			.getUserMedia({ audio: false, video: { width: 100, height: 80, frameRate: { ideal: 5, max: 5 } }})
			.then(this.gotSelfMedia);
		
		this.updatePeers({}, this.props.sessions);
	}
	
	componentWillUnmount() {
		this.selfstream && this.selfstream.getTracks().forEach((track) => track.stop());
		if(this.recorder) this.recorder.stop();
		this.props.endSession();
	}

	componentDidUpdate(oldProps) {
		this.updatePeers(oldProps.sessions, this.props.sessions);
	}

	updatePeers(oldSess, newSess) {
		if(oldSess != newSess) {
			Object.keys(newSess)
				.filter(x => !oldSess.hasOwnProperty(x))
				.forEach(i => this.initPeerVideo(i));
		}
	}

	initPeerVideo = (peer) => {
		let mediaSource = new MediaSource();
		let sourceBuffer = null;

		let chunks = [];

		this.setState({
			activeStreams: {
				...this.state.activeStreams,
				[peer]: window.URL.createObjectURL(mediaSource)		
			}
		});
		
		this.props.sessions[peer].onmessage = (x) => {
			if (sourceBuffer.updating || chunks.length > 0) {
				chunks.push(x.data);
			} else {
				sourceBuffer.appendBuffer(x.data);
			}
		};

		mediaSource.addEventListener('sourceopen', ({currentTarget: ms}) => {
			sourceBuffer = ms.addSourceBuffer(VIDEO_TYPE);
			sourceBuffer.addEventListener('update', () => {
				if (chunks.length > 0 && !sourceBuffer.updating) sourceBuffer.appendBuffer(chunks.shift());
			});
		});
	}

	gotSelfMedia = (stream) => {
		this.selfstream = stream;
		this.recorder = new MediaRecorder(this.selfstream, {
			mimeType: VIDEO_TYPE,
			bitsPerSecond: 100000,
		});

		this.recorder.ondataavailable = ({data}) => {
			data.arrayBuffer().then(buffer => this.workerport.postMessage(new Int8Array(buffer)));
		};
		this.recorder.start({timeSlice: 500});
	};

	render() {
		return (
			<div>
				<UserCheck isOk={this.props.users.includes(this.props.me)}>
					<div className="container x-home">
						{
							Object.entries(this.state.activeStreams).map(([peer, stream]) => <video src={stream} key={peer} autoPlay></video>)
						}
					</div>
				</UserCheck>
			</div>
		);
	}
}