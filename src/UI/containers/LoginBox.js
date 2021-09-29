import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { parseAddr } from 'Approot/misc/util';
import LoadingScreen from '../components/LoadingScreen';
import DchatLogo from 'Approot/UI/components/DchatLogo';
import { login } from '../../redux/actions';
import { deactivateClients } from 'Approot/redux/actions/client';
import { IS_EXTENSION, importWallet } from 'Approot/misc/util';
import { Wallet } from 'nkn-sdk';

const Error = ({ err }) => (
	<>
		{err && (
			err.includes('seed')
				? __('Invalid seed.')
				: __('Wrong password.')
		)}
	</>
);

class LoginBox extends React.Component {
	constructor(props) {
		super(props);
		const [username] = parseAddr(props.activeClient.addr);

		this.state = {
			loading: false,
			username: username || '',
			password: '',
			rememberMe: false,
			showSeedPrompt: false,
			seed: '',
			address: props.activeClient.wallet?.Address || '',
			showError: true,
			error: '',
			importedWallet: '',
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
		this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
		this.handleAccountSwitch = this.handleAccountSwitch.bind(this);
		this.handleKeyStoreUpload = this.handleKeyStoreUpload.bind(this);
	}

	async handleKeyStoreUpload(e) {
		e.preventDefault();
		if (!e.target.files?.length) {
			return;
		}
		const walletJSON = await importWallet(e.target.files[0]);
		this.setState({
			importedWallet: walletJSON,
		});
	}

	handleChange(e) {
		this.setState({ [e.target.name]: e.target.value, showError: false, error: '' });
	}

	handleCheckboxChange(e) {
		this.setState({ [e.target.name]: e.target.checked, showError: false, error: '' });
	}

	handleLoginSubmit(e) {
		e?.preventDefault();
		let seed = this.state.seed;
		if (this.state.importedWallet) {
			try {
				const wallet = Wallet.fromJSON(this.state.importedWallet, { password: this.state.password });
				seed = wallet.getSeed();
			} catch(e) {
				this.setState({
					error: 'Wrong password.',
					showError: true,
				});
				this.flashError();
				return;
			}
		}
		this.props.dispatch(
			login(
				{
					username: this.state.username,
					password: this.state.password,
					rememberMe: this.state.rememberMe,
				},
				this.state.address,
				seed
			)
		);
		this.setState({
			loading: true,
			showError: this.state.error !== this.props.error,
		});
		this.flashError();
	}

	flashError() {
		clearTimeout(this.timeout);
		clearTimeout(this.timeout2);
		// Clunky message flash.
		this.timeout = setTimeout(() => this.setState({
			showError: false,
		}), 1000);
		this.timeout2 = setTimeout(() => this.setState({
			error: '',
		}), 2000);
	}

	// Is this somehow autobound?
	componentWillUnmount() {
		clearTimeout(this.timeout);
		clearTimeout(this.timeout2);
	}

	/**
	 * Account is restored from seed, or 'address' is logged in, or new created.
	 *
	 * See workers/nkn/nknHandler.js
	 */
	handleAccountSwitch(e) {
		const address = e.target.value;
		if (address === 'seed') {
			this.setState({
				showSeedPrompt: true,
			});
		} else {
			this.setState({
				showSeedPrompt: false,
			});
		}
		if (address === 'new' || address === 'seed') {
			this.props.dispatch(deactivateClients());
			this.setState({
				address: '',
				username: '',
			});
		} else {
			const client = this.props.clients.find(c => c.wallet.Address === address);
			const [username] = parseAddr(client.addr);
			this.setState({
				address: address,
				username,
			});
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (
			this.props.error !== prevProps.error
			|| (this.state.error !== prevState.error && this.state.error)
		) {
			const error = this.props.error || this.state.error;
			this.setState({
				error,
				loading: false,
			});
		}
	}

	render() {
		const {
			activeClient,
			clients,
			connecting,
			location,
			loggedIn,
		} = this.props;
		const error = this.state.error;

		const redir =
			location?.search &&
			new URL(`http://example.org/${location.search}`)?.searchParams?.get(
				'returnUrl',
			);

		return (
			<div className="is-overlay x-is-login-overlay">
				{loggedIn ? (
					<LoadingScreen loading={connecting}>
						<Redirect
							to={{
								pathname: redir || '/',
							}}
						/>
					</LoadingScreen>
				) : (
					<div className="hero is-primary is-overlay">
						<div className="hero-body has-background-primary">
							<h1 className="title has-text-centered is-size-2">
								{__('Welcome!')}
							</h1>
							<div className="columns is-centered">
								<div className="column is-9 is-4-desktop">
									<div className="notification is-light">
										<figure className="image container is-64x64">
											<DchatLogo />
										</figure>
										<p className="subtitle has-text-grey has-text-centered">
											{__('The decentralized chat awaits.')}
										</p>

										<form className="" onSubmit={this.handleLoginSubmit}>
											<div className="field">
												<label className="label">
													{__('Log in as')}
												</label>
												<div className="control level">
													<span className="select">
														<select
															name="client"
															id="client"
															defaultValue={activeClient.wallet?.Address || 'new'}
															onChange={this.handleAccountSwitch}
														>
															<option
																value="new"
															>
																-- {__('New wallet')} --
															</option>
															{clients.map(client => (
																<option
																	key={client.wallet.Address}
																	value={client.wallet.Address}
																>
																	{client.addr}
																</option>
															))}
															<option
																value="seed"
															>
																-- {__('Import wallet')} --
															</option>
														</select>
													</span>
												</div>
											</div>
											{this.state.showSeedPrompt && (
												<fieldset className="box is-shadowless x-bordered has-background-light">
													<legend>{__('Seed or key store')}</legend>
													<div className="field">
														<label className="label">
															{__('Wallet seed')}
														</label>
														<div className="control">
															<input
																className="input"
																type="password"
																disabled={!!this.state.importedWallet}
																onChange={this.handleChange}
																placeholder={__('Quite a long string')}
																name="seed"
																autoComplete="off"
																value={this.state.seed}
															/>
														</div>
													</div>
													<div className="field">
														<label className="label">{__('Key store')}</label>
														<div className="control">
															<input
																type="file"
																disabled={!!this.state.seed}
																className="input file"
																onChange={this.handleKeyStoreUpload}
															/>
														</div>
													</div>
												</fieldset>
											)}

											<div className="field">
												<label className="label">
													{__('Nickname')}
												</label>
												<div className="control">
													<input
														type="username"
														name="username"
														value={this.state.username}
														onChange={this.handleChange}
														className="input"
														placeholder="McAfee"
														autoComplete="current-user"
														maxLength="63"
													/>
												</div>
											</div>
											<div className="field">
												<label className="label">
													{__('Password')}
													<span className={classnames('help is-danger is-inline x-visibility', {
														'x-is-transparent': !this.state.showError,
													})}>
														{' '}<Error err={error} />
													</span>
												</label>
												<div className="control">
													<input
														type="password"
														name="password"
														value={this.state.password}
														onChange={this.handleChange}
														className="input password"
														placeholder="Password"
														autoComplete="current-password"
													/>
												</div>
											</div>
											{IS_EXTENSION && (
												<div className="field">
													<div className="control">
														<label className="checkbox">
															<input
																type="checkbox"
																checked={this.state.rememberMe}
																onChange={this.handleCheckboxChange}
																value="rememberMe"
																name="rememberMe"
																id="rememberMe"
															/>
															{__('Store password')}
														</label>
													</div>
												</div>
											)}
											<div className="field">
												<div className="control">
													<button
														type="submit"
														className={classnames('button is-link', {
															'is-loading': this.state.loading,
														})}
													>
														{__('Continue')}
													</button>
												</div>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}
}

const mapStateToProps = state => ({
	loggedIn: state.login?.addr != null,
	connecting: !state.login?.connected,
	error: state.login?.error,
	clients: state.clients,
	activeClient: state.clients.find(c => c.active) || {},
});

export default connect(mapStateToProps)(LoginBox);
