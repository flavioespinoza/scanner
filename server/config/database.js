module.exports = () => {

	const db_url = process.env.DB_URL

	const dbConfig = {
		url: db_url,
		opts: {
			useMongoClient: true,
			autoReconnect: true,
			keepAlive: 300000
		}
	}

	switch (process.env.NODE_ENV) {
		case 'production':
			break
		case 'stage':
			break
		case 'test':
			Object.assign(dbConfig, { url: db_url })
			break
		case 'dev':
		default:
			break
	}

	return dbConfig
}
