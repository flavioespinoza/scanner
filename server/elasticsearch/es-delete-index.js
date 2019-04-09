const dotenv = require('dotenv')
dotenv.load()

const ccxt = require('ccxt')
const params = {
	api_key: '536a94129a1d159409db05e73e259fc1',
	secret: '5c2259a5aab8fa0e505d2a1818843dff'
}
const exchange_name = 'hitbtc'
const exchange_params = {
	name: exchange_name,
	apiKey: params.api_key,
	secret: params.secret,
	nonce: function () {
		return this.milliseconds()
	}
}
const xch = new ccxt.hitbtc2(exchange_params)

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
const es = new elasticsearch.Client({
	hosts: [{
		protocol: 'http',
		host: '178.128.190.197',
		port: 9200,
		country: 'US',
		weight: 10
	}],
	log: 'trace'
})

es.ping({
	// ping usually has a 3000ms timeout
	requestTimeout: 3000
}, async function (error) {
	if (error) {
		console.trace('elasticsearch cluster is down!')
	} else {
		log.bright.cyan('All is well')
	}
})

function _url (exchange_name, market, limit) {

	return `https://min-api.cryptocompare.com/data/histominute?fsym=${market.base}&tsym=${market.quote}&aggregate=1&e=${exchange_name}&limit=${limit}`

}

async function get_data (exchange_name, limit) {

	const fetch_markets = await xch.fetchMarkets()

	const PARENT = [
		{
			base: 'BTC',
			quote: 'USDT',
			symbol: 'BTC/USDT'
		},
		{
			base: 'ETH',
			quote: 'USDT',
			symbol: 'ETH/USDT'
		},
		{
			base: 'ETH',
			quote: 'BTC',
			symbol: 'ETH/BTC'
		}
	]

	const CCL = [
		{
			base: 'CCL',
			quote: 'USD',
			symbol: 'CCL/USDT'
		},
		{
			base: 'CCL',
			quote: 'ETH',
			symbol: 'CCL/ETH'
		}
	]

	const ADA = [
		{
			base: 'ADA',
			quote: 'USDT',
			symbol: 'ADA/USDT'
		},
		{
			base: 'ADA',
			quote: 'BTC',
			symbol: 'ADA/BTC'
		},
		{
			base: 'ADA',
			quote: 'ETH',
			symbol: 'ADA/ETH'
		}
	]

	const NOAH = [
		{
			base: 'NOAH',
			quote: 'USDT',
			symbol: 'NOAH/USDT'
		},
		{
			base: 'NOAH',
			quote: 'BTC',
			symbol: 'NOAH/BTC'
		},
		{
			base: 'NOAH',
			quote: 'ETH',
			symbol: 'NOAH/ETH'
		}
	]

	const ACAT = [
		{
			base: 'ACAT',
			quote: 'USDT',
			symbol: 'ACAT/USDT'
		},
		{
			base: 'ACAT',
			quote: 'BTC',
			symbol: 'ACAT/BTC'
		},
		{
			base: 'ACAT',
			quote: 'ETH',
			symbol: 'ACAT/ETH'
		}
	]

	const DOGE = [
		{
			base: 'DOGE',
			quote: 'USDT',
			symbol: 'DOGE/USDT'
		},
		{
			base: 'DOGE',
			quote: 'BTC',
			symbol: 'DOGE/BTC'
		},
		{
			base: 'DOGE',
			quote: 'ETH',
			symbol: 'DOGE/ETH'
		}
	]

	const markets = [...PARENT, ...CCL, ...ADA, ...NOAH, ...ACAT, ...DOGE]

	const result = {}

	await async.each(fetch_markets, async (market) => {
		const url = _url(exchange_name, market, limit)

		const get_candles = await axios(url)

		const candles = get_candles.data.Data

		// log.blue(market.symbol, candles.length)

		const es_candles = []

		await async.each(candles, async (obj) => {
			const es_candle_obj = await es_data(exchange_name, market, obj)
			if (es_candle_obj) {
				es_candles.push(es_candle_obj)
			}
		})

		result[market.symbol] = es_candles

	})

	return result
}

async function es_data (exchange_name, market, obj) {
	try {

		const volume = _.add(obj.volumefrom, obj.volumeto)

		const timestamp = obj.time * 1000

		const date = new Date(timestamp)

		const _market_name = market_name(market.symbol)

		const _index = 'hitbtc'

		const _name = `candles_${exchange_name}_${_market_name}`

		const _id = `${_name}___${timestamp}`

		const es_candle_obj = {
			timestamp: timestamp,
			date: date,
			close: obj.close,
			high: obj.high,
			low: obj.low,
			open: obj.open,
			volume: volume,
			volumeto: obj.volumeto,
			volumefrom: obj.volumefrom,
			short: null,
			long: null,
			symbol: market.symbol,
			base: market.base,
			quote: market.quote,
			exchange_name: exchange_name,
		}

		const exists = await es.exists({
			index: _index,
			type: _market_name,
			id: _id
		})

		if (!exists) {

			const create_doc = await es.create({
				index: _index,
				type: _market_name,
				id: _id,
				body: es_candle_obj
			})

			log.bright.green('create_doc', create_doc)

			return es_candle_obj

		}

		// else {
		// 	await es.delete({
		// 		index: _index,
		// 		type: _market_name,
		// 		id: _id
		// 	})
		// 	await es.create({
		// 		index: _index,
		// 		type: _market_name,
		// 		id: _id,
		// 		body: es_candle_obj
		// 	})
		// }

	} catch (err) {
		_error('es_data', err)
	}
}

function market_name (sym) {
	return _.toLower(_.toString(sym.replace('/', '_')))
}

(async function () {

	// const candle_data = await get_data(exchange_name, 6000)
	// log.lightBlue('candle_data', candle_data)

	const fetch_markets = await xch.fetchMarkets()

	const res = []

	const indices = [

		 '.kibana',
		 '.monitoring-es-6-2019.01.02',
		 '.monitoring-es-6-2019.01.03',
		 '.monitoring-es-6-2019.01.04',
		 '.monitoring-es-6-2019.01.05',
		 '.monitoring-es-6-2019.01.06',
		 '.monitoring-es-6-2019.01.07',
		 '.monitoring-es-6-2019.01.08',
		 '.monitoring-kibana-6-2019.01.02',
		 '.monitoring-kibana-6-2019.01.03',
		 '.monitoring-kibana-6-2019.01.04',
		 '.monitoring-kibana-6-2019.01.05',
		 '.monitoring-kibana-6-2019.01.06',
		 '.monitoring-kibana-6-2019.01.07',
		 '.monitoring-kibana-6-2019.01.08',

	]

	// _.each(fetch_markets, function (market) {
	// 	const _market_name = market_name(market.symbol)
	// 	const _index = `candles_hitbtc_${_market_name}`
	// 	indices.push(_index)
	// })

	const deleted = []

	await async.each(indices, async (idx) => {
		const exists_index = await es.indices.exists({
			index: idx
		})
		if (exists_index) {
			const deleted_index = await es.indices.delete({
				index: idx
			})
			deleted.push({
				index: idx,
				info: deleted_index
			})
		}

	})

	log.lightCyan({deleted})


})()
