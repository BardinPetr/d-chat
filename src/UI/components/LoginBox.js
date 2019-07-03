import React from 'react';
import './LoginBox.css';
import { __ } from '../../misc/util';
import configs from '../../misc/configs';

class LoginBox extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			username: '',
			password: '',
			error: '',
			cleared: false,
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
		this.clear = this.clear.bind(this);
	}

	handleChange(e) {
		this.setState({ [e.target.name]: e.target.value, error: '' });
	}

	handleLoginSubmit(e) {
		e.preventDefault();
		this.props.login({username: this.state.username, password: this.state.password})
			// See notes in reducers.
			.then(msg => !msg.addr && this.setState({ error: __('Invalid credentials.') }))
			.catch(console.warn);
	}

	clear (e) {
		e.preventDefault();
		configs.walletJSON = configs.$default.walletJSON;
		configs.messages = configs.$default.messages;
		this.setState({ cleared: true });
	}

	render() {
		return (
			<div className="box-container">
				<div className="inner-container">
					<div className="header">
						{ window.location.search.includes('register') ? __('Welcome!') : __('Welcome Back!') }
					</div>

					<p className="description sub-title">
						{ __('The decentralized chat awaits.') }
					</p>

					<p className="error">
						{ this.state.error }
					</p>

					<form className="box" onSubmit={this.handleLoginSubmit}>
						<div className="input-group">
							<label htmlFor="username">{ __('Username') + ' (' + __('optional') + ')' }</label>
							<input
								type="username"
								name="username"
								value={this.state.username}
								onChange={this.handleChange}
								className="login-input"
								placeholder="Username"
								autoComplete="current-user"
							/>
							<label htmlFor="password">{ __('Password') }</label>
							<input
								type="password"
								name="password"
								value={this.state.password}
								onChange={this.handleChange}
								className="login-input"
								placeholder="Password"
								autoComplete="current-user"
								required />
						</div>

						<button className="login-btn">
							{ window.location.search.includes('register') ? __('Register') :  __('Log In') }
						</button>
					</form>
					<div style={{marginTop: '1em'}}>
						{__('Forgot password?') + ' '}
						<a style={
							this.state.cleared ?
								{ color: 'gray', cursor: 'auto' } :
								{ color: 'blue', cursor: 'pointer' }
						} onClick={this.clear}>
							{/* TODO clear chats as well. */}
							{this.state.cleared ? __('Cleared') : __('Reset')}
						</a>
					</div>
				</div>
			</div>
		);
	}
}

export default LoginBox;
