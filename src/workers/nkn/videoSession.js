
class VideoSession {
	constructor(nkn) {
		this.onsessionestablished = null;
		this.onupstreamsessionestablished = null;
		this.videostore = []; 
		this.unconnected_peers = new Set();
		this.pending_peers = new Set();
		this.upstream_peers = {}; 
		this.downstream_peers = {}; 
		this.nkn = nkn;
		this.isactive = true;
		this.output_queues = {}; 
		this.is_sending = {};
        
		this.nkn.listen();
		this.nkn.onSession(this.onDownstreamSession);

		setInterval(() => this.dial([]), 5000);
	}

	set onSessionEstablished (cb) {
		this.onsessionestablished = cb;
	}

	set onUpstreamSessionEstablished (cb) {
		this.onupstreamsessionestablished = cb;
	}

	onDownstreamSession = (session) => {
		if(!this.isactive) return;

		console.log('got downstream session:', session); 
		let peer = session.remoteAddr;

		let channel = new MessageChannel();
		this.onsessionestablished(channel.port1, peer);
		this.downstream_peers[peer] = {
			port: channel.port2,
			session
		};
	
		if (!this.unconnected_peers.has(peer)) this.dial([peer]);

		const readall = () => session.read().then((data) => {
			channel.port2.postMessage(data);
			this.isactive && readall();
		});
		readall();
	}

	dial(peers) {
		peers.forEach((addr) => (addr != this.nkn.addr && !this.pending_peers.has(addr) && !(addr in this.upstream_peers)) && this.unconnected_peers.add(addr));
		// console.log('Dialling', this.unconnected_peers);

		this.unconnected_peers.forEach(async (peer) => {
			this.pending_peers.add(peer);				
			const session = await this.nkn.dial(peer);
			this.unconnected_peers.delete(peer);		
			this.pending_peers.delete(peer);		

			console.log('got upstream session:', session); 

			const {port1, port2} = new MessageChannel();		
			this.onupstreamsessionestablished(port1, peer);
			this.upstream_peers[session.remoteAddr] = {
				session,
				port: port2,
				connectedAt: Date.now()
			};
			this.output_queues[peer] = [];
			this.is_sending[peer] = false;

			port2.onmessage = ({data}) => {
				this.output_queues[peer].push(data);
				this.checkSend(peer);
			};
		});
	}

	checkSend(peer) {
		if(this.output_queues[peer].length > 0 && !this.is_sending[peer]) {
			this.is_sending[peer] = true;
			let next = this.output_queues[peer][0];
			this.upstream_peers[peer].session
				.write(next)
				.then(() => {
					this.is_sending[peer] = false;
					this.output_queues[peer].shift();
					this.checkSend(peer);
				})
				.catch(() => this.checkSend(peer));
		}
	}

	setSelfPort(port) {
		this.port = port;
	}

	end() {
		this.isactive = false;
		Object.values(this.downstream_peers)
			.concat(Object.values(this.upstream_peers))
			.forEach(({session}) => session.close());
	}
}

export default VideoSession;