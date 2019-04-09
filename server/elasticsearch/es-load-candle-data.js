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
const aggs = require('./aggs/scanner/candles_agg')

const elasticsearch = require('elasticsearch')
const es = new elasticsearch.Client({
	hosts: [{
		protocol: 'http',
		host: '178.128.190.197',
		port: 9200,
		country: 'US',
		weight: 10
	}],
	log: ['error']
})

es.ping({
	// ping usually has a 3000ms timeout
	requestTimeout: 3000
}, async function (error) {
	if (error) {
		console.error('elasticsearch cluster is down!')
	} else {
		log.bright.cyan('All is well')
	}
})

const _index = 'hitbtc_1m'

const _type = 'candles'

function market_name (sym) {
	return _.toLower(_.toString(sym.replace('/', '_')))
}


function _url (exchange_name, market, limit) {

	return `https://min-api.cryptocompare.com/data/histominute?fsym=${market.base}&tsym=${market.quote}&aggregate=1&e=${exchange_name}&limit=${limit}`

}

function _url_hitbtc (market) {

	return `https://api.hitbtc.com/api/2/public/candles/${market.pairing_raw}?period=M1&sort=ASC&limit=1000`

}

async function get_data (exchange_name, assigned_markets, idx) {
	try {

		const result = {}

		await async.each(assigned_markets, async (market) => {

			market.pairing = market.pairing
			market.pairing_raw = market.pairing_raw

			const url_hitbtc = _url_hitbtc(market)

			const get_candles_hitbtc = await axios(url_hitbtc)

			const candles_hitbtc = get_candles_hitbtc.data

			const existing_candles = await aggs.get_candles(market.symbol, 1, 10000, 0)

			if (existing_candles.length > 0) {

				let es_candles = []

				const last = _.last(existing_candles)

				const find_index = _.findIndex(candles_hitbtc, function (obj) {
					return obj.timestamp === last.date
				})

				let idx = find_index - 1

				let replace_candles = []

				for (let i = idx; i < candles_hitbtc.length; i++) {

					replace_candles.push(candles_hitbtc[i])

				}

				await async.each(replace_candles, async (obj) => {
					const es_candle_obj = await es_data(exchange_name, market, obj)
					if (es_candle_obj) {
						es_candles.push(es_candle_obj)
					}
				})

				result[market.symbol] = {
					idx: idx,
					candles: es_candles.length
				}

				// log.lightYellow(idx, es_candles.length)
				// log.lightYellow(idx, result)

			} else {

				let es_candles = []

				await async.each(candles_hitbtc, async (obj) => {
					const es_candle_obj = await es_data(exchange_name, market, obj)
					if (es_candle_obj) {
						es_candles.push(es_candle_obj)
					}
				})

				result[market.symbol] = {
					idx: idx,
					candles: es_candles.length
				}

				// log.green(idx, es_candles.length)
				// log.green(idx, result)

			}

		})

		return result

	} catch (err) {
	  _error('get_data', err)
	}
}

async function es_data (exchange_name, market, obj) {
	try {

		const timestamp = new Date(obj.timestamp).getTime()

		const date = new Date(timestamp)

		const _pairing = `${market.base}${market.quote}`

		const _market_name = market_name(market.symbol)

		const _name = `candles_${exchange_name}_${_market_name}`

		const _id = `${_name}___${timestamp}`

		const es_candle_obj = {
			timestamp: timestamp,
			date: date,
			close: +obj.close,
			high: +obj.max,
			low: +obj.min,
			open: +obj.open,
			volume: +obj.volume,
			volumeQuote: +obj.volumeQuote,
			symbol: market.symbol,
			pairing: _pairing,
			market_name: _market_name,
			base: market.base,
			quote: market.quote,
			exchange_name: exchange_name
		}

		const exists = await es.exists({
			index: _index,
			type: _type,
			id: _id
		})

		if (!exists) {
			const create_doc = await es.create({
				index: _index,
				type: _type,
				id: _id,
				body: es_candle_obj
			})

			log.bright.green('create_doc', create_doc)

		}
		else {
			const remove_doc = await es.delete({
				index: _index,
				type: _type,
				id: _id
			})

			const replace_doc = await es.create({
				index: _index,
				type: _type,
				id: _id,
				body: es_candle_obj
			})

			log.bright.blue('replace_doc', replace_doc)
		}

		return 'done'

	} catch (err) {
		_error('es_data', err)
	}
}

async function delete_indices (indices) {
	try {

		const result = []

		await async.each(indices, async (index_name) => {

			const exists = await es.indices.exists({
				index: index_name
			})

			if (exists) {
				const delete_index = await es.indices.delete({
					index: index_name
				})
				result.push({
					...delete_index,
					name: index_name,
				})
			}

		})

		return result

	} catch (err) {
	  _error('delete_indices', err)
	}
}

function remove (indices) {
	try {
		(async function () {
			const remove = await delete_indices(indices)
			log.red({remove})
		})()
	} catch (err) {
		_error('remove', err)
	}
}

function update_data (exchange_name, markets, idx) {

	let _assigned_markets = markets

	let _idx = idx

	try {

		(async function () {
			const candle_data = await get_data(exchange_name, _assigned_markets, _idx)
			if (candle_data) {
				setTimeout(function () {
					(async function () {
						await update_data(exchange_name, _assigned_markets, _idx)
					})()
				}, 5000)
			}
		})()

	} catch (err) {
	  _error('update_data', err)
	}
}

function init () {
	try {
		(async function () {

			const fetch_markets = await xch.fetchMarkets()

			const all_markets = _.sortBy(fetch_markets, function (obj) {
				return obj.id
			})

			function splitArray(array, numChunks) {
				return _.reduce(_.range(numChunks), ({array, result, numChunks}, chunkIndex) => {
					const numItems = Math.ceil(array.length / numChunks)
					const items = _.take(array, numItems)
					result.push(items)
					return {
						array: _.drop(array, numItems),
						result,
						numChunks: numChunks - 1
					}
				}, {
					array,
					result: [],
					numChunks
				}).result
			}

			const split = splitArray(all_markets, 10)

			update_data(exchange_name, all_markets, 0)

		})()
	} catch (err) {
	  _error('init', err)
	}
}

// init()

let _remove = [

]

remove(_remove)

module.exports = { update_data }


