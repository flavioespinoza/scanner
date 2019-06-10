const log = require('ololog').configure({locate: false})

const _error = function (method, err, socket) {
	log.lightYellow(`${method}__ERROR `, err.message)
	if (socket) {

		socket.emit(`${method}__ERROR `, err.message)
	}
}

async function each (array, callback) {
	try {
		for (let index = 0; index < array.length; index++) {
			await callback(array[index], index, array)
		}
	} catch (err) {
	  _error('async.each', err)
	}
}