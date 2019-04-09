const records = [

// {
// 	id: 1,
// 	username: 's',
// 	password: 's',
// 	displayName: 'flavs',
// 	exchange: {
// 		hitbtc: {
// 			api_key: '536a94129a1d159409db05e73e259fc1',
// 			secret: '5c2259a5aab8fa0e505d2a1818843dff'
// 		}
// 	},
// 	emails: [{
// 		value: 'flavio.espinoza@gmail.com'
// 	}]
// },
//
// {
// 	id: 2,
// 	username: 'stryfist',
// 	password: 'happyfish',
// 	displayName: 'stryfist',
// 	exchange: {
// 		hitbtc: {
// 			api_key: 'b4ad7152ab77a7403c83f0cd2675e61c',
// 			secret: '38ae72fa65f1299859882c50a198f58e'
// 		}
// 	},
// 	emails: [{
// 		value: 'jeremiahkephart@gmail.com'
// 	}]
// }

]

exports.findById = function (id, cb) {
	process.nextTick(function () {
		let idx = id - 1
		if (records[idx]) {
			cb(null, records[idx])
		} else {
			cb(new Error('User ' + id + ' does not exist'))
		}
	})
}

exports.findByUsername = function (username, cb) {
	process.nextTick(function () {
		for (let i = 0, len = records.length; i < len; i++) {
			let record = records[i]
			if (record.username === username) {
				return cb(null, record)
			}
		}
		return cb(null, null)
	})
}
