import _ from 'lodash'
import { APP_NAMESPACE } from '../../util/redux-constants'
import { get, post } from '../../util/http-utils'
import { deleteCookie, getCookie, setCookie } from '../../util/cookie-utils'
import { updateStore, buildGenericInitialState, handleError } from '../../util/store-utils'
import { getAppUrl } from '../../util/environment-utils'
import { socket } from '../../redux/modules/socket_actions'
import { _log, log } from '../../util/utils'
import { ___set_auth_user } from '../../index'


const AUTH_ENDPOINT_BASE = 'auth'
const typeBase = `${APP_NAMESPACE}/${AUTH_ENDPOINT_BASE}/`


// Constants
export const CHANGE_AUTH = `${typeBase}CHANGE_AUTH`
export const SET_POST_AUTH_PATH = `${typeBase}SET_POST_AUTH_PATH`
export const RESET_PASSWORD = `${typeBase}RESET_PASSWORD`
export const GET_AUTHENTICATED_USER = `${typeBase}GET_AUTHENTICATED_USER`


// Set authenticated user with location_href
socket.on('auth_user', function (data) {

	log.green(data)
	___set_auth_user(data)

})


// Methods
/**
 * register - Creates a new account for a user
 * @param {Object} formData  User's form data
 */
export const register = formData => async (dispatch) => {
	try {
		const response = await post(dispatch, CHANGE_AUTH, `${AUTH_ENDPOINT_BASE}/register`, formData, false)
		if (response) {
			// on authentication set the JWT as a cookie
			setCookie('token', response.token, {maxAge: response.tokenExpiration})
			window.location.href = `${getAppUrl()}/simple_list`
		}
	} catch (err) {
		await handleError(dispatch, err, CHANGE_AUTH)
	}
}



/**
 * login - Authenticate a user with an email and password
 * @param {Object} credentials  Login credentials (email, password)
 */
export const login = (credentials) => async (dispatch) => {
	try {
		const response = await post(dispatch, CHANGE_AUTH, `${AUTH_ENDPOINT_BASE}/login`, credentials, false)
		if (response) {
			// on authentication set the JWT as a cookie
			setCookie('token', response.token, {maxAge: response.tokenExpiration})
			window.location.href = `${getAppUrl()}/simple_list`
		}
	} catch (err) {
		await handleError(dispatch, err, CHANGE_AUTH)
	}
}


/**
 * setPostAuthPath  - Save Desired Pre-Auth Path to State
 * @param {String} payload  The desired path, saved pre-authentication
 * @returns {function}
 */
export const setPostAuthPath = (payload) => (dispatch) => {
	dispatch({
		type: SET_POST_AUTH_PATH,
		payload
	})
}


/**
 * logoutUser  - Log user out by clearing auth state and token cookie
 */
export const logoutUser = () => (dispatch) => {
	dispatch({type: CHANGE_AUTH, payload: {}})
	deleteCookie('token')
	window.location.href = `${getAppUrl()}/login`
}


/**
 * forgotPassword - Sends user an email with a token to reset their password
 * @param {Object} formData  The user's email address
 * @returns {Promise}
 */
export const forgotPassword = formData => async (dispatch) => {
	try {
		const response = await post(dispatch, CHANGE_AUTH, `${AUTH_ENDPOINT_BASE}/forgot-password`, formData, false)
		return Promise.resolve(response)
	} catch (err) {
		await handleError(dispatch, err, CHANGE_AUTH)
	}
}


/**
 * resetPassword - Resets a user's password, given a valid token
 * @param {Object} formData  The user's email address
 * @param {String} token     Valid token required for password reset
 * @returns {Promise}
 */
export const resetPassword = (formData, token) => async (dispatch) => {
	try {
		const response = await post(dispatch, CHANGE_AUTH, `${AUTH_ENDPOINT_BASE}/reset-password/${token}`, formData, false)
		return Promise.resolve(response)
	} catch (err) {
		await handleError(dispatch, err, CHANGE_AUTH)
	}
}


/**
 * getAuthenticatedUser - Retrieves the logged in user's information
 * @returns {Promise}
 */
export const getAuthenticatedUser = () => async (dispatch) => {
	try {

		const response = await get(dispatch, GET_AUTHENTICATED_USER, `${AUTH_ENDPOINT_BASE}/list_simple`, true)

		if (response.user.id === '') {
			dispatch({type: CHANGE_AUTH, payload: {}})
			deleteCookie('token')
			window.location.href = `${getAppUrl()}/login`
			return;
		}

		response.user.path_name = window.location.pathname

		const data = {
			auth_user: response.user,
		}

		socket.emit('authenticated_user', data)

		return Promise.resolve(response)

	} catch (err) {
		await handleError(dispatch, err, GET_AUTHENTICATED_USER)
	}
}


// State
const INITIAL_STATE = {
	authenticated: Boolean(getCookie('token')),
	user: '',
	...buildGenericInitialState([CHANGE_AUTH, SET_POST_AUTH_PATH, RESET_PASSWORD, GET_AUTHENTICATED_USER])
}


// Actions
export default (state = INITIAL_STATE, action) => {
	switch (action.type) {

		case CHANGE_AUTH:
			return updateStore(state, action, {authenticated: Boolean(_.get(action, 'payload.token')), user: _.get(action, 'payload.user.id')})

		case GET_AUTHENTICATED_USER:
			return updateStore(state, action,  {user: _.get(action, 'payload.user.id')})

		default:
			return state

	}
}