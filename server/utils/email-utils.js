const dotenv = require('dotenv')
dotenv.load()

const sgMail = require('@sendgrid/mail')

const sengrid_key = process.env.SENGRID_KEY

const log = require('ololog').configure({locate: false})

const _error = function (method, err, socket) {
	log.lightYellow(`${method}__ERROR`, err.message)
	if (socket) {
		socket.emit(`${method}__ERROR`, err.message)
	}
}

exports._send_email = async (email, body) => {

	try {

		sgMail.setApiKey(sengrid_key)

		let text = body.text

		let msg = {
			to: email,
			from: body.from,
			subject: body.subject,
			text: text,
			html: '<div>' +
			'<h3>eScanner.co</h3>' +
			'<p>' + text + '</p>' +
			'</div>'
		}

		sgMail.send(msg)

	} catch (err) {
	  _error('_send_email', err)
	}

}