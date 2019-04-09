import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { reduxForm } from 'redux-form'
import { Link } from 'react-router-dom'
import TextInput from '../form-fields/text-input'
import GenericForm from '../form-fields/generic-form'
import { forgotPassword, RESET_PASSWORD } from '../../redux/modules/authentication'
import { errorPropTypes } from '../../util/proptype-utils'
import { _log, log } from '../../util/utils'

import {

	DocumentCard,
	DocumentCardActivity,
	DocumentCardTitle,
	DocumentCardLogo

} from 'office-ui-fabric-react/lib/DocumentCard'

const form = reduxForm({
	form: 'forgotPassword'
})

class ForgotPassword extends Component {
	constructor (props) {
		super(props)

		this._formSubmit = this._formSubmit.bind(this)

		this.state = {
			show_msg: false,
			msg: `We sent you an email containing a password reset link. It will expire in one hour.`,
			email: null
		}

	}

	static propTypes = {
		forgotPassword: PropTypes.func,
		handleSubmit: PropTypes.func,
		errors: errorPropTypes,
		message: PropTypes.string,
		loading: PropTypes.bool
	}

	static formSpec = [
		{
			id: 'email',
			name: 'email',
			label: 'Email',
			type: 'email',
			placeholder: 'you@yourdomain.com',
			component: TextInput
		}
	]

	_formSubmit = (formProps) => {

		// log.cyan(formProps)

		this.props.forgotPassword(formProps)

		this.setState({
			email: formProps.email
		})

		setTimeout(() => {
			this.setState({
				show_msg: true
			})
		}, 2000)

	}

	render () {

		const { handleSubmit } = this.props

		const { show_msg, msg, email } = this.state

		const logoProps = {
			logoIcon: 'OutlookLogo'
		}

		const login_reset = () => {

			return (
				<DocumentCard className={'login-reset-card'}>

					<DocumentCardLogo {...logoProps} />

					<div className="ms-ConversationTile-TitlePreviewArea">
						<DocumentCardTitle
							className={'login-reset-title'}
							title={msg}
							shouldTruncate={true}
							showAsSecondaryTitle={true}/>
					</div>

					<DocumentCardActivity activity={email}
										  people={[
											  {
												  name: 'BOSS',
												  profileImageSrc: '',
												  initials: 'B'
											  }
										  ]} />

				</DocumentCard>
			)
		}

		return (
			<div className={'auth-box'}>
				{show_msg ? login_reset() : <div>
					<h1>Forgot Password</h1>

					<GenericForm onSubmit={handleSubmit(this._formSubmit)}
								 formSpec={ForgotPassword.formSpec}
								 submitText={'Reset Password'}/>

					<Link className={'inline'} to={'/login'}>Back to login</Link>
				</div>}
			</div>
		)
	}
}

function mapStateToProps (state) {

	return {
		authenticated: state.authenticated
	}
}

export default connect(
	mapStateToProps,

	{forgotPassword}
)(form(ForgotPassword))
