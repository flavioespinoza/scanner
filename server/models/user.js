const mongoose = require('mongoose')

const bcrypt = require('bcrypt')

const ROLES = require('../constants').ROLES

const Schema = mongoose.Schema

const utils = require('../utils')

const _log = utils._log

const log = require('ololog').configure({locate: false})

//= ===============================
// User Schema
//= ===============================
const userTime = {
	timestamps: true,
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
}

const UserSchema = new Schema({
	lastName: {type: String, unique: true, required: true},
	firstName: {type: String, unique: true, required: true},
	email: {type: String, unique: true, required: true},
	zipCode: {type: Number, unique: true, required: true},
	password: {type: String, unique: true, required: true},
	insertdt: {type: Date, default: Date.now}
}, userTime)




UserSchema.virtual('fullName').get(function virtualFullName () {
	return `${this.firstName} ${this.lastName}`
})

async function hashPassword (next) {
	const user = this
	if (user && user.isModified('password')) {
		try {
			const salt = await bcrypt.genSalt(5)
			user.password = await bcrypt.hash(user.password, salt, null)
			return next()

		} catch (err) {
			return next(err)
		}
	} else {
		return next()
	}

}

UserSchema.pre('save', hashPassword)
UserSchema.pre('update', hashPassword)

UserSchema.methods.comparePassword = async function comparePassword (candidatePassword) {
	try {
		return await bcrypt.compare(candidatePassword, this.password)
	} catch (err) {
		throw new Error(err)
	}
}

module.exports = mongoose.model('User', UserSchema)
