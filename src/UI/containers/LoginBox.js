import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import { parseAddr, formatAddr } from 'Approot/misc/util';
import LoadingScreen from '../components/LoadingScreen';
import DchatLogo from 'Approot/UI/components/DchatLogo';
import { login } from '../../redux/actions';
import { deactivateClients } from 'Approot/redux/actions/client';
import { IS_EXTENSION } from 'Approot/misc/util';

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
			username: username || '',
			password: '',
			rememberMe: false,
			showSeedPrompt: false,
			seed: '',
			address: props.activeClient.wallet?.Address || '',
			showError: true,
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
		this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
		this.handleAccountSwitch = this.handleAccountSwitch.bind(this);
	}

	handleChange(e) {
		this.setState({ [e.target.name]: e.target.value });
	}

	handleCheckboxChange(e) {
		this.setState({ [e.target.name]: e.target.checked });
	}

	handleLoginSubmit(e) {
		e?.preventDefault();
		this.props.dispatch(
			login(
				{
					username: this.state.username,
					password: this.state.password,
					rememberMe: this.state.rememberMe,
				},
				this.state.address,
				this.state.seed
			)
		);

		// Clunky message flash.
		this.setState({
			showError: true,
		}, () => {
			this.timeout = setTimeout(() => this.setState({
				showError: false,
			}), 10);
		});
	}

	// Is this somehow autobound?
	componentWillUnmount() {
		clearTimeout(this.timeout);
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

	render() {
		const {
			activeClient,
			clients,
			connecting,
			error,
			location,
			loggedIn,
		} = this.props;

		const redir =
			location?.search &&
			new URL(`http://example.org/${location.search}`)?.searchParams?.get(
				'returnUrl',
			);

		return (
			<div className="is-overlay">
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
																	{formatAddr(client.addr)}
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
												<div className="field">
													<label className="label">
														{__('Wallet seed')}
													</label>
													<div className="control">
														<input
															className="input"
															type="password"
															onChange={this.handleChange}
															placeholder={__('Quite a long base58 string')}
															name="seed"
															autoComplete="off"
															value={this.state.seed}
														/>
													</div>
												</div>
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
														pattern="[^\/]*"
														autoComplete="current-user"
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
													<button type="submit" className="button is-link">
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
	activeClient: state.clients.filter(c => c.active)[0] || {},
});

export default connect(mapStateToProps)(LoginBox);
