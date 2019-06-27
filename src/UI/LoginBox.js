import React from 'react';
import './LoginBox.css';
import configs from '../../Configs';
import { __ } from './util';

class LoginBox extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			username: '',
			password: '',
			error: '',
			isNewUser: false,
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
	}

	componentDidMount() {
		configs.$loaded.then(() => this.setState({ isNewUser: configs.walletJSON == null }));
	}

	handleChange(e) {
		this.setState({[e.target.name]: e.target.value});
	}

	handleLoginSubmit(e) {
		e.preventDefault();
		// if (!this.state.password) {
		//   alert('Should put in your password')
		//   return
		// }
		this.props.login({username: this.state.username, password: this.state.password}).then(msg => msg != null && this.setState({ error: msg }));
	}

	render() {
		return (
			<div className="box-container">
				<div className="inner-container">
					<div className="header">
						{	__('Welcome Back!')	}
					</div>

					<p className="description">
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
							{ this.state.isNewUser ? __('Register') :  __('Log In') }
						</button>
					</form>
				</div>
			</div>
		);
	}
}

export default LoginBox;
