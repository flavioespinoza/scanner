const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10

const UserSchema = new Schema({
	lastName: {type: String, unique: true, required: true},
	firstName: {type: String, unique: true, required: true},
	email: {type: String, unique: true, required: true},
	zipCode: {type: Number, unique: true, required: true},
	password: {type: String, unique: true, required: true},
	insertdt: {type: Date, default: Date.now}
})

UserSchema.pre('save', (next) => {

	const user = this

	if (!user.isModified('password')) return next()

	bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {

		if (err) return next(err)

		bcrypt.hash(user.password, salt, (err, hash) => {

			if (err) return next(err)

			user.password = hash
			next()

		})
	})
})

UserSchema.methods.comparePassword = (candidatePassword, cb) => {
	bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
		if (err) return cb(err)
		cb(null, isMatch)
	})
}

module.exports = mongoose.model('User', UserSchema)