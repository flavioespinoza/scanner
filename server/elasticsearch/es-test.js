const elasticsearch = require('elasticsearch')

const es = new elasticsearch.Client({
	hosts: [{
		protocol: 'http',
		host: '35.247.36.244',
		port: 9200,
		country: 'US',
		weight: 10
	}],
	log: ['error']
})

es.ping({
	// ping usually has a 3000ms timeout
	requestTimeout: 5000
}, async function (error) {
	if (error) {
		console.trace('elasticsearch cluster is down!')
	} else {
		console.log('All is well')
	}
})
