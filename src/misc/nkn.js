import nkn from	'nkn-client';
import nknWallet from	'nkn-wallet';
import configs from './configs';
import { genChatID } from './util';

const	BUCKET = 0;
// testnet - What does this even matter?
const FORBLOCKS = 10000;

/**
 * Couple of helpers for nkn module.
 *
 * Saves walletJSON to sync storage.
 */
class	NKN	extends	nkn	{

	constructor({username, password})	{
		let wallet;
		const walletJSON = configs.walletJSON;

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

	subscribe	=	topic	=> {
		console.log('Subscribing to', topic);
		return this.wallet.subscribe(
			genChatID( topic ),
			BUCKET,
			FORBLOCKS,
			this.password,
			this.identifier
		);
	}

	// I don't know	how	to override	functions	in react/babel.	Keeps	throwing errors. Traditional publish(){} doesn't work	either.
	// publish = (topicID, message)	=> {
	publishMessage = (topic, message)	=> {
		console.log('Publishing message', message,'to', topic);
		this.publish(
			genChatID( topic ),
			BUCKET,
			JSON.stringify(message)
		);
	}

}

export default NKN;
