import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'redux-form'
import Alert from '../notification/alert'
import { errorPropTypes } from '../../util/proptype-utils'

import _ from 'lodash'
import { _log, log } from '../../util/utils'
import { DefaultButton, PrimaryButton, IButtonProps } from 'office-ui-fabric-react/lib/Button'
import { Label } from 'office-ui-fabric-react/lib/Label'


const required = value => (value || typeof value === 'number' ? undefined : 'Required')

const maxLength = max => value =>
	value && value.length > max ? `Must be ${max} characters or less` : undefined

const maxLength15 = maxLength(15)

export const minLength = min => value =>
	value && value.length < min ? `Must be ${min} characters or more` : undefined
export const minLength2 = minLength(2)
const number = value =>
	value && isNaN(Number(value)) ? 'Must be a number' : undefined
const minValue = min => value =>
	value && value < min ? `Must be at least ${min}` : undefined
const minValue13 = minValue(13)
const email = value =>
	value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
		? 'Invalid email address'
		: undefined
const tooYoung = value =>
	value && value < 13
		? 'You do not meet the minimum age requirement!'
		: undefined
const aol = value =>
	value && /.+@aol\.com/.test(value)
		? 'Really? You still use AOL for your email?'
		: undefined
const alphaNumeric = value =>
	value && /[^a-zA-Z0-9 ]/i.test(value)
		? 'Only alphanumeric characters'
		: undefined
export const phoneNumber = value =>
	value && !/^(0|[1-9][0-9]{9})$/i.test(value)
		? 'Invalid phone number, must be 10 digits'
		: undefined

const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
const mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");



const maxLength2 = max => value =>
	value && value.length > max ? `Must be ${max} characters or less` : undefined


const passwordValidate = (value) => {
	let strong = strongRegex.test(value)
	return value && strong ? `Must be 8 characters long and must have 1 number, 1 uppercase, and 1 special character` : undefined
}


export const passwordsMustMatch = (value, allValues) => {
	return value !== allValues.password ? 'Passwords do not match' : undefined
}



const GenericForm = ({formSpec = [], errors = [], message = '', onSubmit, submitText}) => {

	console.log(formSpec)


	const list = _.map(formSpec, (field) => {

		if (field.id === 'firstName' || field.id === 'lastName') {
			field.validate = [required, maxLength15, minLength2]
		}
		else if (field.id === 'email') {
			field.validate = [required, email]
		}
		else if (field.id === 'password') {
			field.validate = [required]
		}
		else if (field.id === 'passwordConfirm') {
			field.validate = [required, passwordsMustMatch]
		}

	 	return (
			<li key={field.id}>
				<Field {...field} />
			</li>
		)

	})

	return (
		<form className={'form'} onSubmit={onSubmit}>

			<Alert errors={errors} icon={'error_outline'} />

			<Alert message={message} icon={'done'}/>

			<ul className="form-list login-ul">
				{list}
			</ul>

			<div className={'form-login-btn-wrapper'}>
				<PrimaryButton type={'submit'} className="button is-primary">{submitText}</PrimaryButton>
			</div>

		</form>
	)
}

GenericForm.propTypes = {
	onSubmit: PropTypes.func,
	formSpec: PropTypes.arrayOf(PropTypes.shape({
		placeholder: PropTypes.string,
		type: PropTypes.string,
		id: PropTypes.string,
		name: PropTypes.string,
		label: PropTypes.string,
		component: PropTypes.func
	})),
	message: PropTypes.string,
	errors: errorPropTypes,
	submitText: PropTypes.string
}

export default GenericForm
