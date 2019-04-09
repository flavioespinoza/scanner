const dotenv = require('dotenv')
dotenv.load()

const _ = require('../async')
const log = require('ololog').configure({locate: false})
const Chance = require('chance')
const chance = new Chance()
const _error = function (method, err, socket) {
	log.lightYellow(`${method}__ERROR `, err.message)
	if (socket) {

		socket.emit(`${method}__ERROR `, err.message)
		const bcrypt = require('bcrypt')
	}
}

const db = require('./mongo-db')
const bcrypt = require('bcrypt')
const salt_rounds = 12

const cypher = require('../cypher')
const encryption_key = process.env.ENCRYPTION_KEY

const api_keys = [
	{
		exchange_name: 'hitbtc',
		api_key: '536a94129a1d159409db05e73e259fc1',
		secret: '5c2259a5aab8fa0e505d2a1818843dff'
	},
	{
		exchange_name: 'bittrex',
		api_key: 'e8d2650f49254c599d4f8aca375cfa93',
		secret: 'db808cb30da14c79b967b566cb1ec56c'
	}
]

async function encrypt_api_keys (obj) {
	try {
		const api_key = await cypher.encrypt(obj.api_key, encryption_key)
		const secret = await cypher.encrypt(obj.secret, encryption_key)

		// const encrypted_exchange = await encrypt_exchange(api_keys)
		// log.blue('encrypted_exchange', encrypted_exchange)

		return {
			exchange_name: obj.exchange_name,
			api_key: api_key,
			secret: secret
		}

	} catch (err) {
		_error('encrypt_api_keys', err)
	}
}

async function decrypt_api_keys (obj) {
	try {
		const api_key = await cypher.decrypt(obj.api_key, encryption_key)
		const secret = await cypher.decrypt(obj.secret, encryption_key)

		return {
			exchange_name: obj.exchange_name,
			api_key: api_key,
			secret: secret
		}
	} catch (err) {
		_error('decrypt_api_keys', err)
	}
}

async function encrypt_exchange (api_keys) {
	try {

		let result = []

		await _.each(api_keys, async (obj) => {
			let hashed_keys = await encrypt_api_keys(obj)
			result.push(hashed_keys)
		})

		return result

	} catch (err) {
		_error('encrypt_exchange', err)
	}
}

async function decrypt_exchange (api_keys) {
	try {

		let result = []

		await _.each(api_keys, async (obj) => {
			let decrypted_keys = await decrypt_api_keys(obj)
			result.push(decrypted_keys)
		})

		return result

	} catch (err) {
		_error('decrypt_exchange', err)
	}
}

async function register (req, res) {

	log.red(req.body)


	try {

		let type = req.body.type

		log.lightYellow('type', type)

		if (type === 'reset_password') {

			let email = req.body.email

			let password = req.body.password

			let hashed_password = await bcrypt.hash(password, salt_rounds)

			log.lightBlue('email', email)

			let update_hash = {
				_id: email,
				password: hashed_password
			}

			db.update(db.users_cl, update_hash)
				.then(function (res) {
					log.lightCyan(res)
				})

		}
		else if (type === 'register') {

			log.lightRed('register', req.body)

			let username = req.body.username

			let password = req.body.password

			let hashed_password = await bcrypt.hash(password, salt_rounds)

			let email = req.body.email

			db.get_one(db.users_cl, {_id: email})
				.then(async function (user_res) {
					log.lightMagenta(user_res)
					if (!user_res) {

						let user_hash = {
							_id: email,
							username: username,
							call_sign: username,
							password: hashed_password,
							exchange: api_keys,
							email: email,
							reset_password_token: null,
							reset_password_expires: null
						}

						let user = {
							_id: email,
							username: username,
							call_sign: username,
							email: email
						}

						log.lightYellow('user_hash', JSON.stringify(user_hash, null, 2))

						db.update(db.users_cl, user_hash)
							.then(function () {
								const data = ['boobs', 'more boobs', 'all the (nice) boobs']
								res.json({
									success: true,
									message: 'Success',
									sub_message: 'Welcome!',
									data: data,
									...user,
								})
							})

					} else {

						let user = {
							_id: username,
							username: username,
							call_sign: username,
							email: email,
						}

						res.json({
							success: false,
							message: 'Already Registered',
							sub_message: 'This username and email all ready exists! Please login to continue!',
							data: [],
							...user
						})

					}
				})

		}




	} catch (err) {
		_error('register', err)
	}
}

async function verify_password (password, hashed_password) {
	try {
		const match = await bcrypt.compare(password, hashed_password)

		if (match) {
			log.black('validate_user', match)
		} else {
			console.error('validate_user', match)
		}
		return match
	} catch (err) {
		_error('validate_user', err)
	}
}

async function validate_user (username, password) {
	try {
		return new Promise(function (resolve) {
			db.find_one(db.users_cl, {username: { $eq: username }})
				.then(function (user) {
					// log.magenta('user', user);
					if (user) {
						(async function () {

							log.red(password)
							log.blue(user.password)

							const password_verified = await verify_password(password, user.password)

							resolve({
								password_verified: password_verified,
								user: user,
								message: `password_verified = ${password_verified}`
							})

						})()
					} else {

						resolve({
							password_verified: false,
							user: undefined,
							message: 'Username and email not found. Please register as a new user.'
						})

					}
				})
		})
	} catch (err) {
	  _error('validate_user', err)
	}
}

async function get_user (username) {
	try {
		return new Promise(function (resolve) {
			db.get_one(db.users_cl, {_id: username})
				.then(async function (user) {
					// log.magenta('get_user', user);
					if (!user) {
						resolve({
							success: false,
							user: user,
						})
					} else {
						resolve({
							success: true,
							user: user,
						})
					}
				})
		})
	} catch (err) {
	  _error('get_user', err)
	}
}

module.exports = { register, validate_user, get_user }