// import {_log, log } from './utils'
//
// /** NODE_ENV */
// require('dotenv').config()
//
// const PROCESS = process.env
// const NODE_ENV = process.env.NODE_ENV
// const DIRECTORY = process.env.DIRECTORY

// _log.info('NODE_ENV --> client/environment-utils.js')
// log.lightBlue(NODE_ENV)
//
// _log.warn('PROCESS --> client/environment-utils.js')
// log.lightMagenta(PROCESS)
//
// _log.cyan('DIRECTORY --> client/environment-utils.js')
// log.cyan(DIRECTORY)

/**
 * getEnvironment - Returns the current environment, or development by default
 * @returns {String}
 */
export const getEnvironment = () => {

	if (process.env.REACT_APP_ENV) {
		return process.env.REACT_APP_ENV
	} else {
		return 'development'
	}

}
/**
 * getApiUrl  - Returns the URL for the api, given the current environment
 * @returns {String}
 */
export const getApiUrl = () => {

	switch (getEnvironment()) {

		case 'production':
			return 'https://escanner.co'

		default:
			return 'http://localhost:6001'

	}

}

/**
 * getAppUrl  - Returns the URL for the app, given the environment
 * @returns {String}
 */
export const getAppUrl = () => {

	switch (getEnvironment()) {

		case 'production':
			return 'https://escanner.co'

		case 'development':
		default:
			return 'http://localhost:8080'

	}

}