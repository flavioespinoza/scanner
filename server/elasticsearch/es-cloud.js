const log = require('ololog').configure({locate: false})
const _ = require('lodash')
const Chance = require('chance')
const chance = new Chance()
const async = require('../async')
const _error = function (method, err, socket) {
	log.lightYellow(`${method}__ERROR`, err.message)
	if (socket) {
		socket.emit(`${method}__ERROR`, err.message)
	}
}
const axios = require('axios')

const elasticsearch = require('elasticsearch')


const username = 'elastic'
const password = '4YkGkmL1yTJKUWjhQnt1CXNf'
const cloud_id = ':dXMtZWFzdC0xLmF3cy5mb3VuZC5pbyRmNzI2ZjlkODgzYmY0NjE0YTYwNjczMDQwNmIzNWI4NiRmNjkyM2M5NzIwY2Q0NzlkOTBjODVkZDdlNzU0NzBiMA=='
const cloud_auth = `${username}:${password}`

const endpoint = {
	es: 'https://f726f9d883bf4614a606730406b35b86.us-east-1.aws.found.io:9243',
	kibana: 'https://f6923c9720cd479d90c85dd7e75470b0.us-east-1.aws.found.io:9243'
}

const es = new elasticsearch.Client({
	host: [
		{
			host: 'https://f726f9d883bf4614a606730406b35b86.us-east-1.aws.found.io',
			auth: 'elastic:4YkGkmL1yTJKUWjhQnt1CXNf',
			protocol: 'https',
			port: 9243
		}
	]
})

es.ping({
	// ping usually has a 3000ms timeout
	requestTimeout: 3000
}, function (error) {
	if (error) {
		console.trace('elasticsearch cluster is down!')
	} else {
		log.bright.cyan('All is well')
	}
})



