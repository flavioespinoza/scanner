import _ from 'lodash'
import {

	PENDING,
	SUCCESS,
	ERROR,

} from './redux-constants'

import { _log } from './utils'
const log = require('ololog').configure({locate: false})

/**
 * updateStore  - Returns an object containing updated state. This helper
 *                builds generic state (messages, errors, loading)
 *
 * @param {Object} state          Current state of the store
 * @param {Object} action         Redux action for the store to respond to
 * @param {Object} [extraValues]  Any additional state to be assigned
 * @returns {Object}
 */
export const updateStore = (state, action, extraValues = {}) => {

	const {type = '', payload = {}, meta = {status: ''}} = action

	switch (meta.status) {
		case SUCCESS:
			return {
				...state,
				...extraValues,
				loading: {...state.loading, [type]: false},
				messages: {...state.messages, [type]: _.get(payload, 'message')},
				errors: {...state.errors, [type]: []}
			}
		case ERROR:
			return {
				...state,
				loading: {...state.loading, [type]: false},
				messages: {...state.messages, [type]: ''},
				errors: {...state.errors, [type]: _.get(payload, 'data.errors') || _.get(payload, 'errors') || action.payload || []}
			}
		case PENDING:
		default:
			return {
				...state,
				loading: {...state.loading, [type]: true},
				messages: {...state.messages, [type]: ''},
				errors: {...state.errors, [type]: []}
			}
	}
}

/**
 * buildGenericInitialState  - Builds initial state for a set of constants
 *                             (loading, errors, messages)
 *
 * @param {Array} constants  Array of constants to build state around
 * @returns {Object}
 */
export const buildGenericInitialState = constants => ({
	messages: constants.reduce((retObj, constant) => {
		retObj[constant] = ''
		return retObj
	}, {}),
	errors: constants.reduce((retObj, constant) => {
		retObj[constant] = []
		return retObj
	}, {}),
	loading: constants.reduce((retObj, constant) => {
		retObj[constant] = false
		return retObj
	}, {})
})

/**
 * handleError  - Dispatches error properly to Redux stores
 *
 * @param {Function} dispatch Redux dispatch function
 * @param {Object}   error    Error container
 * @param {String}   type     Action type constant for error received
 */
export const handleError = (dispatch, error, type) => {
	const foundError = _.get(error, 'response.data.errors') || [{error}]
	return dispatch({
		type,
		payload: foundError,
		meta: {status: ERROR}
	})
}

/**
 * removeMetaFromState  - Remove metadata from state (general selector)
 *
 * @param {Object} state  State to filter metadata out of
 */
export const removeMetaFromState = state => Object.keys(state).reduce((accum, val) => {
	if (val !== 'errors' && val !== 'messages' && val !== 'loading') {
		accum[val] = state[val]
	}

	return accum
}, {})
