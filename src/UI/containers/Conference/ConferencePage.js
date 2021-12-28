import React, { Component } from 'react';
// import React, { Component, createRef, useEffect } from 'react';
import ReactPlayer from 'react-player';


// const Video = ({ stream }) => {
// 	const localVideo = createRef();
  
// 	useEffect(() => {
// 		if (localVideo.current) localVideo.current.srcObject = stream;
// 	}, [stream, localVideo]);
  
// 	return (
// 		<video style={{ height: 100, width: 200 }} ref={localVideo} autoPlay muted/>
// 	);
// };

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

const VIDEO_TYPE = 'video/webm; codecs="vp8, opus"';

export default class ConferencePage extends Component {
	constructor(props) {
		super(props);

		// let channel = new MessageChannel();
		// this.workerport = channel.port1;
		
		this.state = {
			activeStreams: {},
			selfstream: null,
		};

		this.recorders = {};
	}

	componentDidMount() {
		navigator.mediaDevices
			.getUserMedia({ 
				audio: true, 
				video: {
					width: 100,
					height: 80, 
					frameRate: { ideal: 1, max: 3 } 
				}})
			.then(this.gotSelfMedia);

		this.updateUpstreamSessions({}, this.props.upstreamSessions);
		this.updateDownstreamSessions({}, this.props.sessions);
	}
	
	gotSelfMedia = (stream) => {
		console.log('Got self media', stream);
		this.setState({
			selfstream: stream
		});

		let channel = new MessageChannel();
		this.props.beginSession(channel.port1, this.props.users);
	};

	componentWillUnmount() {
		if (this.state.selfstream) this.state.selfstream.getTracks().forEach((track) => track.stop());
		if (this.recorder) this.recorder.stop();
		this.props.endSession();
	}

	componentDidUpdate(oldProps) {
		this.updateDownstreamSessions(oldProps.sessions, this.props.sessions);
		this.updateUpstreamSessions(oldProps.upstreamSessions, this.props.upstreamSessions);
	}

	updateDownstreamSessions(oldSess, newSess) {
		if(oldSess != newSess) {
			Object.keys(newSess)
				.filter(x => !(x in oldSess))
				.forEach(i => this.initPeerVideo(i));
		}
	}

	updateUpstreamSessions(oldSess, newSess) {
		if(oldSess != newSess) {
			Object.keys(newSess)
				.filter(x => !(x in oldSess))
				.forEach(i => this.initUpstream(i));
		}
	}

	initUpstream = (peer) => {
		if((peer in this.recorders)) return;
		this.recorders[peer] = new MediaRecorder(this.state.selfstream, {
			mimeType: VIDEO_TYPE,
			// bitsPerSecond: 100000,
		});

		this.recorders[peer].ondataavailable = ({data}) => {
			data.arrayBuffer().then(buffer => 
				this.props.upstreamSessions[peer].postMessage(new Int8Array(buffer))
			);
		};

		// To allow NKN handshake process finish we delay first packages, otherwise will get "NotHandshakeError: first packet is not handshake packet" 
		setTimeout(() => this.recorders[peer].start({timeSlice: 1000}), 10000);  
	}

	initPeerVideo = (peer) => {
		if(!this.props.sessions[peer]) return;
		// this.props.sessions[peer].onmessage = () => {
		// 	console.log('read', peer);
		// };

		let mediaSource = new MediaSource();
		let sourceBuffer = null;

		let chunks = [];

		this.setState({
			activeStreams: {
				...this.state.activeStreams,
				[peer]: window.URL.createObjectURL(mediaSource)		
			}
		});
		
		mediaSource.addEventListener('sourceopen', () => {
			sourceBuffer = mediaSource.addSourceBuffer(VIDEO_TYPE);

			this.props.sessions[peer].onmessage = ({data}) => {
				if (sourceBuffer.updating || chunks.length > 0) {
					chunks.push(data);
				} else {
					sourceBuffer.appendBuffer(data);
				}
			};	
			
			const updLstn = () => {
				if (chunks.length > 0 && !sourceBuffer.updating) sourceBuffer.appendBuffer(chunks.shift());
			};
			sourceBuffer.addEventListener('update', updLstn);

			// const errLstn = () => {
			// 	sourceBuffer.abort();
			// 	sourceBuffer.removeEventListener('error', errLstn);
			// 	sourceBuffer.removeEventListener('update', updLstn);
			// 	this.initPeerVideo(peer);
			// };
			// sourceBuffer.addEventListener('error', errLstn);
		});
	}

	render() {
		return (
			<div>
				<UserCheck isOk={this.props.users.includes(this.props.me)}>
					<div className="container x-home">
						{this.state.selfstream && <div>ME<ReactPlayer playing={true} url={this.state.selfstream}/></div>}
						{
							Object.entries(this.state.activeStreams)
								.map(([peer, stream]) => 
									<div key={peer}>
										{peer}
										<ReactPlayer playing={true} url={stream}/>
									</div>
								)
						}
					</div>
				</UserCheck>
			</div>
		);
	}
}