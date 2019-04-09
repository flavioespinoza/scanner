module.exports = () => {

	const emailConfig = {
		apiKey: 'key-xxxx',
		domain: 'mg.yourdomain.com'
	}

	switch (process.env.NODE_ENV) {
		case 'production':
			break
		case 'stage':
			break
		case 'dev':
		default:
			break
	}

	return emailConfig
}
