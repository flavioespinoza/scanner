import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { reduxForm } from 'redux-form'
import { Link } from 'react-router-dom'
import TextInput from '../form-fields/text-input'
import GenericForm from '../form-fields/generic-form'
import { login, CHANGE_AUTH } from '../../redux/modules/authentication'
import { errorPropTypes } from '../../util/proptype-utils'

import { _log, log } from '../../util/utils'
import { DefaultButton, PrimaryButton, IButtonProps } from 'office-ui-fabric-react/lib/Button'
import { Label } from 'office-ui-fabric-react/lib/Label'

const form = reduxForm({
	form: 'login'
})

class Login extends Component {

	static propTypes = {
		handleSubmit: PropTypes.func,
		desiredPath: PropTypes.string,
		login: PropTypes.func,
		errors: errorPropTypes,
		message: PropTypes.string,
		loading: PropTypes.bool
	}

	static formSpec = [
		{
			id: 'email',
			name: 'email',
			type: 'email',
			placeholder: 'Email',
			component: TextInput
		},
		{
			id: 'password',
			name: 'password',
			type: 'password',
			placeholder: 'Password',
			component: TextInput
		}
	]

	_loginFormSubmit = (form_props) => {

		const { desiredPath } = this.props

		if (desiredPath) {
			this.props.login(form_props, desiredPath)
		} else {
			this.props.login(form_props)
		}
	}

	render = () => {

		const { handleSubmit, errors, message, loading } = this.props

		return (
			<div className={`auth-box ${loading ? 'is-loading' : ''}`}>

				<h1>Login</h1>

				<GenericForm onSubmit={handleSubmit(this._loginFormSubmit)}
							 errors={errors}
							 message={message}
							 formSpec={Login.formSpec}
							 submitText={'Login'} />


				<Link className="inline" to="/forgot-password">Forgot password</Link>

				<div className={'auth-box-actions'} >or</div>

				<Link className="inline" to="/register">Register</Link>

			</div>
		)
	}
}

const mapStateToProps = ({authentication}) => ({
	errors: authentication.errors[CHANGE_AUTH],
	message: authentication.messages[CHANGE_AUTH],
	loading: authentication.loading[CHANGE_AUTH],
	authenticated: authentication.authenticated,
	desiredPath: authentication.desiredPath
})

export default connect(mapStateToProps, {login})(form(Login))
