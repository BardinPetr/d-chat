
class VideoSession {
	constructor(nkn) {
		this.notconnected = [];
		this.peers = {}; // for connected peers
		this.nkn = nkn;
		this.isactive = true;
        
		this.nkn.listen();
		this.nkn.onSession(this.onSession);
	}

	set onSessionEstablished (cb) {
		this.onsessionestablished = cb;
	}

	onSession = (session) => {
		if(!this.isactive) return;

		console.log('got session:', session); 
		let peer = session.remoteAddr;

		// if(this.peers[peer]) session.close();

		let channel = new MessageChannel();
		this.onsessionestablished(channel.port1, peer);
		this.peers[peer] = {
			port: channel.port2,
			session
		};
		const readall = () => session.read().then((data) => {
			channel.port2.postMessage(data);
			console.log(data);
			this.isactive && readall();
		});
		readall();
	}

	dial(peers) {
		this.notconnected = peers.filter(val => val != this.nkn.addr);
		Promise.all(
			this.notconnected.map(peer => 
				new Promise((resolve) => 
					this.nkn.dial(peer)
						.then((session) => {
							this.onSession(session);
							resolve();
						})
				))).then();
	}

	broadcast(data) {
		for (const i in this.peers) {
			this.peers[i].session.write(data).then();
		}
	}

	setSelfPort(port) {
		this.port = port;
		this.port.onmessage = ({data}) => this.broadcast(data);
	}

	end() {
		this.isactive = false;
		for (const i in Object.values(this.peers)) {
			i.session.close();
		}
	}
}

export default VideoSession;