import nkn from	'nkn-client';
import nknWallet from	'nkn-wallet';
import configs from '../../Configs';

const	BUCKET = 0;
// textnet - What does this even matter?
const FORBLOCKS = 10000;

/**
 * Couple of helpers for nkn module.
 *
 * Saves walletJSON to sync storage.
 */
class	NKN	extends	nkn	{

	constructor({username, password, walletJSON})	{
		let wallet;
		if (walletJSON) {
			console.log('Loading existing wallet!');
			wallet = nknWallet.loadJsonWallet(walletJSON, password);

			if ( !wallet || !wallet.getPrivateKey ) {
				throw 'Invalid credentials';
			}
		} else {
			console.log('Creating new wallet.');
			wallet = nknWallet.newWallet(password);
			configs.walletJSON = wallet.toJSON();
		}
		super({
			identifier:	username.trim() || 'Pseudonymous',
			privateKey:	wallet.getPrivateKey()
		});
		this.wallet	=	wallet;
		this.password	=	password;
	}

	subscribe	=	topicID	=> {
		console.log('Subscribing to', topicID);
		return this.wallet.subscribe(
			topicID,
			BUCKET,
			FORBLOCKS,
			this.password,
			this.identifier
		);
	}

	// I don't know	how	to override	functions	in react/babel.	Keeps	throwing errors. Traditional publish(){} doesn't work	either.
	// publish = (topicID, message)	=> {
	publishMessage = (topicID, message)	=> {
		console.log('Publishing message', message,'to', topicID);
		this.publish(
			topicID,
			BUCKET,
			JSON.stringify(message)
		);
	}

}

export default NKN;
