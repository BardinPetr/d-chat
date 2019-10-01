import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { __ } from 'Approot/misc/browser-util-APP_TARGET';
import LoadingScreen from '../components/LoadingScreen';
import DchatLogo from 'Approot/UI/components/DchatLogo';
import { login, logout } from '../../redux/actions';

class LoginBox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			password: '',
			cleared: false,
			rememberMe: false,
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
		this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
		this.clear = this.clear.bind(this);
	}

	handleChange(e) {
		this.setState({ [e.target.name]: e.target.value, error: '' });
	}

	handleCheckboxChange(e) {
		this.setState({ [e.target.name]: e.target.checked, error: '' });
	}

	handleLoginSubmit(e) {
		e.preventDefault();
		// See notes in reducer.
		this.props
			.dispatch(
				login({
					username: this.state.username,
					password: this.state.password,
					rememberMe: this.state.rememberMe,
				}),
			);
	}

	clear(e) {
		e.preventDefault();
		this.setState({ cleared: true });
		this.props.dispatch(logout());
	}

	render() {
		const { loggedIn, connecting, error } = this.props;

		return loggedIn ? (
			<LoadingScreen loading={connecting}>
				<Redirect
					to={{
						pathname: '/',
					}}
				/>
			</LoadingScreen>
		) : (
			<div className="hero is-primary">
				<div className="hero-body" style={{ height: '100vh' }}>
					<h1 className="title has-text-centered is-size-2">
						{window.location.search.includes('register')
							? __('Welcome!')
							: __('Welcome Back!')}
					</h1>
					<div className="columns is-centered">
						<div className="column is-half">
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
											{__('Username')}
											<span className="has-text-grey-light is-size-7">
												{' (' + __('optional') + ')'}
											</span>
										</label>
										<div className="control">
											<input
												type="username"
												name="username"
												value={this.state.username}
												onChange={this.handleChange}
												className="input"
												placeholder="Username"
												autoComplete="current-user"
											/>
										</div>
									</div>
									<div className="field">
										<label className="label">
											{__('Password')}
											<span className="help is-danger is-inline">
												{error && __('Wrong password.')}
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
												autoComplete="current-user"
												required
											/>
										</div>
									</div>
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
									<div className="field">
										<div className="control">
											<button type="submit" className="button is-link">
												{window.location.search.includes('register')
													? __('Create')
													: __('Log In')}
											</button>
										</div>
									</div>
								</form>
								<div style={{ marginTop: '1em' }}>
									{__('Forgot password?') + ' '}
									<a
										style={
											this.state.cleared
												? { color: 'gray', cursor: 'auto' }
												: { color: 'blue', cursor: 'pointer' }
										}
										onClick={this.clear}
									>
										{this.state.cleared
											? __('Wallet removed')
											: __('Remove wallet')}
										.
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	loggedIn: state.login?.addr != null,
	connecting: !state.login?.connected,
	wrongPassword: state.login?.error,
});

export default connect(mapStateToProps)(LoginBox);
