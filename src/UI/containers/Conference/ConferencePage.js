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

export default class ConferencePage extends Component {
	constructor(props) {
		super(props);

		let channel = new MessageChannel();
		this.workerport = channel.port1;

		this.props.beginSession(channel.port2, this.props.users);
	
		var a = 'a.0e7997f5d0f00c3753baae3e38c2f6db840dca1b856af5ee6ba8f858bdc68e4b';
		var b = 'a.0e7997f5d0f00c3753baae3e38c2f6db840dca1b856af5ee6ba8f858bdc68e4b';
	
		if(this.props.sessions[a]) {
			this.props.sessions[a].onmessage = (x) => console.log('RECV', x);
		}	
		if(this.props.sessions[b]) {
			this.props.sessions[b].onmessage = (x) => console.log('RECV', x);
		}	
	
		console.log('$', this.props.sessions);
	
		// setInterval(() => {
		// channel.port1.postMessage(Uint8Array.from([1, 2, 3, 4, 5]));
		// }, 1000);

		this.state = {
			activeStreams: []
		};
	}

	componentDidMount() {
		navigator.mediaDevices
			.getUserMedia({ audio: false, video: { width: 100, height: 80, frameRate: { ideal: 1, max: 2 } }})
			.then(this.gotSelfMedia);
	}
	
	componentWillUnmount() {
		if(this.recorder) this.recorder.stop();
		this.props.endSession();
	}

	componentDidUpdate(oldProps) {
		if(oldProps.sessions != this.props.sessions) {
			let toInit = Object.keys(this.props.sessions).filter(x => oldProps.sessions.hasOwnProperty(x));
			console.log(toInit);
		}
	}

	gotSelfMedia = (stream) => {
		this.recorder = new MediaRecorder(stream, {
			mimeType: 'video/webm;codecs=vp9',
			bitsPerSecond: 800,
		});

		this.recorder.ondataavailable = ({data}) => {
			data.arrayBuffer().then(buffer => {
				buffer;
				this.workerport.postMessage(new Int8Array(buffer));
			});
		};
		this.recorder.start({timeSlice: 2000});
	};

	render() {
		return (
			<div>
				<UserCheck isOk={this.props.users.includes(this.props.me)}>
					<div className="container x-home">
						{/* {
							for(let i of this.state.activeStreams)
						} */}
					</div>
				</UserCheck>
			</div>
		);
	}
}