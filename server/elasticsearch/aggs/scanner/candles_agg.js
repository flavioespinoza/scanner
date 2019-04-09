const dotenv = require('dotenv')
dotenv.load()

const api_key = process.env.HIT_BTC_API_KEY
const secret = process.env.HIT_BTC_SECRET

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

const util = require('util')
const _ = require('lodash')
const log = require('ololog').configure({locate: false})
const _error = function (method, err, socket) {
	log.lightYellow(`${method}__ERROR`, err.message)
	if (socket) {
		socket.emit(`${method}__ERROR`, err.message)
	}
}

const utils = require('../../../utils')
const _log = utils._log
const _get_market = utils._get_market

const async = require('../../../async')
const jsonexport = require('jsonexport')
const fs = require('fs')

const timeFormat = require('d3-time-format').timeFormat
const formatDate = timeFormat('%b %e, %_I:%M %p')

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

/** Elasticsearch Inputs ------------
 *
 * */
const _index = 'hitbtc_candles'
const _type = 'candle'

/** User Inputs ------------
 *
 * */

let candle_params = {
	symbol: 'BTC/USDT',
	interval: 1,
	from: 10000,
	to: 0,
}

let percent_rise = 0.03
let percent_drop = 0.03

function all_markets () {
	return {
		"size": 1,
		"query": {
			"bool": {
				"must_not" : {
					"terms" : { "market_name" : [] }
				},
				"filter": [
					{
						"range": {
							"date": {
								"from": "now-1000m",
								"to": "now-0m"
							}
						}
					}
				]
			}
		},
		"aggs": {
			"the_interval": {
				"date_histogram": {
					"field": "date",
					"interval": "60m"
				},
				"aggs": {
					"the_open": {
						"top_hits": {
							"sort": [
								{
									"date": {
										"order": "asc"
									}
								}
							],
							"_source": {
								"includes": [
									"date",
									"base",
									"open"
								]
							},
							"size": 1
						}
					},
					"the_close": {
						"top_hits": {
							"sort": [
								{
									"date": {
										"order": "desc"
									}
								}
							],
							"_source": {
								"includes": [
									"date",
									"timestamp",
									"close"
								]
							},
							"size": 1
						}
					},
					"the_high": {
						"max": {
							"field": "high"
						}
					},
					"the_low": {
						"max": {
							"field": "low"
						}
					},
					"the_volume": {
						"sum": {
							"field": "volume"
						}
					},
					"the_volume_quote": {
						"sum": {
							"field": "volumeQuote"
						}
					},
					"the_symbol" : {
						"terms" : { "field" : "symbol.keyword" }
					},
					"the_exchange_name" : {
						"terms" : { "field" : "exchange_name.keyword" }
					},
					"the_market_name" : {
						"terms" : { "field" : "market_name.keyword" }
					},
					"the_pairing" : {
						"terms" : { "field" : "pairing.keyword" }
					},
					"the_base" : {
						"terms" : { "field" : "base.keyword" }
					},
					"the_quote" : {
						"terms" : { "field" : "quote.keyword" }
					}
				}
			}
		}
	}
}

/** Helper Functions ------------
 *
 * */
function write_to_cvs (data, file_name) {

	jsonexport(data, function (err, csv) {

		if (err) return console.log(err)

		fs.writeFile(`${file_name}.csv`, csv, (err) => {
			// throws an error, you could also catch it here
			if (err) throw err

			// success case, the file was saved
			log.lightYellow(`${file_name}`)
		})

	})
}

function are_equal (arr) {
	let len = arr.length
	for (let i = 1; i < len; i++) {
		if (arr[i] === null || arr[i] !== arr[i - 1])
			return false
	}
	return true
}

function compare_sequence (arr, sequential_count) {

	if (!sequential_count) {
		sequential_count = 3
	}

	let result = []

	_.each(arr, function (obj, i) {

		if (i === 0 || i === 1) {

		} else {

			let len = sequential_count

			let res = []
			let indices = []

			while (len > 0) {
				len--
				let idx = i - len
				indices.push(idx)
				res.push(arr[idx])
			}

			if (are_equal(res)) {

				// console.log(`Value is ${res[0]} --> Indices are: `, indices)

				result.push({
					value: res[0],
					indices: indices
				})

			}

		}

	})

	return result

}

function market_name (sym) {

	return _.toLower(sym.replace('/', '_'))

}



/** Elasticsearch Query Methods ------------
 *
 * */
function all_by_symbol (symbol) {
	return {
		query: {
			bool: {
				must: {
					term: {
						market_name: market_name(symbol)
					}
				}
			}
		}
	}
}

function all_by_symbol_range (symbol, from, to) {
	return {
		query: {
			bool: {
				must: {
					term: {
						market_name: market_name(symbol)
					}
				},
				filter: [{
					range: {
						date: {
							from: `now-${from}m`,
							to: `now-${to}m`
						}
					}
				}]
			}
		}
	}
}

function ohlvc (symbol, interval, from, to) {

	const _market_name = market_name(symbol)

	const _query = {
		size: 0,
		query: {
			bool: {
				must: {
					term: {
						market_name: _market_name
					}
				},
				filter: [{
					range: {
						date: {
							from: `now-${from}m`,
							to: `now-${to}m`
						}
					}
				}]
			}
		},
		aggs: {
			the_interval: {
				date_histogram: {
					field: 'date',
					interval: `${interval}m`
				},
				aggs: {
					the_exchange_name : {
						terms : { field : 'exchange_name.keyword' }
					},
					the_open: {
						top_hits: {
							sort: [{
								date: {
									order: 'asc'
								}
							}],
							_source: {
								includes: ['date', 'timestamp', 'open']
							},
							size: 1
						}
					},
					the_close: {
						top_hits: {
							sort: [{
								date: {
									order: 'desc'
								}
							}],
							_source: {
								includes: ['date', 'timestamp', 'close']
							},
							size: 1
						}
					},
					the_high: {
						max: {
							field: 'high'
						}
					},
					the_low: {
						min: {
							field: 'low'
						}
					},
					the_volume: {
						sum: {
							field: 'volume'
						}
					},
					the_volume_quote: {
						sum: {
							field: 'volumeQuote'
						}
					}
				}
			}
		}
	}

	return _query
}

function moving_avg (symbol, interval, window) {
	return {
		size: 0,
		query: {
			bool: {
				must: {
					term: {
						market_name: market_name(symbol)
					}
				}
			}
		},
		aggs: {
			the_interval: {
				date_histogram: {
					field: 'date',
					interval: `${interval}m`
				},
				aggs: {
					the_close_sum: {
						sum: {field: 'close'}
					},
					the_movavg: {
						moving_avg: {
							buckets_path: 'the_close_sum',
							window: window,
							model: 'simple'
						}
					}
				}
			}
		}
	}
}


/** Get Candles ------------
 *
 * @method
 * @name get_candles
 * @desc Constructor for Foundational Candle Data used for Scanner Algorithms
 * @param symbol <p>Market symbol - example: BTC/USDT<p/>
 * @param interval <p>Interval in min (m) - example: 1 = 1m, 15 = 15m, 60 = 60m = 1hr, 120 = 120m = 2hrs<p/>
 * @param from <p>Range in min furthest from now in the past - example: 1440 = 1440m = 24hrs in the past will be your
 *     'from' range<p/>
 * @param to <p>Range in min closest to now or in the past - example: 0 = 0m = now will be your 'to' range<p/>
 *
 */
async function get_candles (symbol, interval, from, to, index, type) {

	try {


		const query = ohlvc(symbol, interval, from, to)

		// log.black(JSON.stringify(query))

		const es_search = await es.search({
			index: index,
			type: type,
			body: query
		})

		const es_buckets = es_search.aggregations.the_interval.buckets

		const candles = []

		_.each(es_buckets, function (obj) {

			if (obj.the_high.value) {

				candles.push({
					date: obj.key_as_string,
					date_string: formatDate(obj.key),
					timestamp: obj.key,
					symbol: symbol,
					interval: `${interval}m`,
					open: obj.the_open.hits.hits[0]._source.open,
					close: obj.the_close.hits.hits[0]._source.close,
					high: obj.the_high.value,
					low: obj.the_low.value,
					volume: obj.the_volume.value,
					volume_quote: obj.the_volume_quote.value,
					candle_count: obj.doc_count
				})

			}

		})

		return candles

	} catch (err) {
		_error('get_candles', err)
	}

}

async function get_scanner_candles (market, interval, from, to, index, type) {

	try {

		const query = ohlvc(market.symbol, interval, from, to)

		// log.black(JSON.stringify(query))

		const es_search = await es.search({
			index: index,
			type: type,
			body: query
		})

		const es_buckets = es_search.aggregations.the_interval.buckets

		const candles = []

		_.each(es_buckets, function (obj) {

			if (obj.the_high.value) {

				let _close_timestamp = obj.the_close.hits.hits[0]._source.timestamp

				candles.push({
					...market,
					date: obj.key_as_string,
					date_string: formatDate(obj.key),
					timestamp: obj.key,
					interval: `${interval}m`,
					open: obj.the_open.hits.hits[0]._source.open,
					close: obj.the_close.hits.hits[0]._source.close,
					close_timestamp: _close_timestamp,
					high: obj.the_high.value,
					low: obj.the_low.value,
					volume: obj.the_volume.value,
					volume_quote: obj.the_volume_quote.value,
					candle_count: obj.doc_count
				})

			}

		})

		return candles

	} catch (err) {
		_error('get_scanner_candles', err)
	}

}

async function get_all_markets () {

	try {

		const query = all_markets()

		// log.black(JSON.stringify(query))

		const es_search = await es.search({
			index: _index,
			type: _type,
			body: query
		})

		const es_buckets = es_search.aggregations.the_interval.buckets

		log.cyan('es_buckets.length', es_buckets.length)

		const candles = []

		_.each(es_buckets, function (obj) {

			console.log(obj.buckets)

			if (obj.the_high.value) {

				candles.push({
					date: obj.key_as_string,
					timestamp: obj.key,
					symbol: obj.the_symbol.value,
					pairing: obj.the_pairing.value,
					interval: `60m`,
					open: obj.the_open.hits.hits[0]._source.open,
					close: obj.the_close.hits.hits[0]._source.close,
					high: obj.the_high.value,
					low: obj.the_low.value,
					volume: obj.the_volume.value,
					volume_quote: obj.the_volume_quote.value,
					candle_count: obj.doc_count
				})

			}

		})

		return candles

	} catch (err) {
		_error('get_all_markets', err)
	}

}

/** Previous Close ------------
 * @method
 * @name await prev_close ({symbol, interval, from, to}, sequential_count)
 * @desc Adds comparison property to candles of net gain or loss vs previous close price
 * @object {
 * 		@param symbol <p><b>Market Symbol</b> - example: ADA/USDT, ADA/BTC, ADA/ETH<p/>
 * 	 	@param interval <p>Interval in min (m) - example: 1 = 1m, 15 = 15m, 60 = 60m = 1hr, 120 = 120m = 2hrs<p/>
 * 		@param from <p>Range in min furthest from now in the past - example: 1440 = 1440m = 24hrs - in the past will be your 'from' range<p/>
 * 		@param to <p>Range in min closest to now - example: 0 = 0m = now - will be your 'to' range<p/>
 * }
 *
 * @param sequential_count <p>Number of consecutive instances of gains or losses for the given <b>Market Symbol</b><p/>
 *
 */
async function prev_close ({symbol, interval, from, to}, sequential_count) {

	function map_data (obj) {
		return {
			date: obj.date,
			date_string: obj.date_string,
			timestamp: obj.timestamp,
			symbol: obj.symbol,
			interval: obj.interval,
			open: obj.open,
			close: obj.close,
			high: obj.high,
			low: obj.low,
			volume: obj.volume,
			volume_quote: obj.volume_quote,
			close_sum: obj.close_sum,
			moving_avg_close: obj.moving_avg_close,
			model: obj.model,
			window: obj.window,
			candle_count: obj.candle_count,
			close_percent_change: obj.close_percent_change,
			sequential_count: obj.sequential_count,
			net_prev_close: obj.net_prev_close,
			alerts: obj.comparison_net_prev_close,
		}
	}

	try {

		const result = []

		const fetch_candles = await get_candles(symbol, interval, from, to)

		for (let i = 0; i < fetch_candles.length; i++) {

			if (i > 0) {
				let now_candle = fetch_candles[i].close
				let prev_candle = fetch_candles[i - 1].close
				fetch_candles[i].close_percent_change = (now_candle - prev_candle) / prev_candle
			}

		}

		const res_candles = _.map(fetch_candles, function (obj) {

			obj.comparison_net_prev_close = 'white'
			obj.sequential_count = sequential_count

			if (obj.close_percent_change === 0) {
				obj.net_prev_close = 'neutral'
			}
			else if (Math.sign(obj.close_percent_change) === 1) {
				obj.net_prev_close = 'gain'
			}
			else if (Math.sign(obj.close_percent_change) === -1) {
				obj.net_prev_close = 'loss'
			}

			return obj

		})

		const net_prev_close = _.map(res_candles, function (obj) {
			return obj.net_prev_close
		})

		const compare_net_prev_close = compare_sequence(net_prev_close, sequential_count)

		_.each(compare_net_prev_close, function (obj) {

			if (obj.value === 'no data' || obj.value === 'neutral') {

			}
			else if (obj.value === 'gain') {
				for (let i = 0; i < obj.indices.length; i++) {
					res_candles[obj.indices[i]].comparison_net_prev_close = 'green'
				}
			}
			else if (obj.value === 'loss') {
				for (let i = 0; i < obj.indices.length; i++) {
					res_candles[obj.indices[i]].comparison_net_prev_close = 'red'
				}
			}

		})

		_.each(res_candles, function (obj) {
			result.push(map_data(obj))
		})

		return result

	} catch (err) {
	  _error('prev_close', err)
	}

}

/** Previous Close by Percentage ------------
 * @method
 * @name await async function prev_close_by_percentage ({symbol, interval, from, to}, percent_rise, percent_drop)
 * @desc Adds comparison property to candles of net gain or loss vs previous close price
 * @object {
 * 	 @param symbol <p><b>Market Symbol</b> - example: ADA/USDT, ADA/BTC, ADA/ETH<p/>
 *	 @param interval <p>Interval in min (m) - example: 1 = 1m, 15 = 15m, 60 = 60m = 1hr, 120 = 120m = 2hrs<p/>
 *	 @param from <p>Range in min furthest from now in the past - example: 1440 = 1440m = 24hrs in the past will be
 *     your 'from' range<p/>
 *	 @param to <p>Range in min closest to now or in the past - example: 0 = 0m = now will be your 'to' range<p/>
 * }
 *
 * @param percent_rise <p>Percentage gain from previous close price<p/>
 * @param percent_drop <p>Percentage loss from previous close price<p/>
 *
 */
async function prev_close_by_percentage ({symbol, interval, from, to}) {

	function map_data (obj) {
		return {
			date: obj.date,
			date_string: obj.date_string,
			timestamp: obj.timestamp,
			symbol: obj.symbol,
			interval: obj.interval,
			open: obj.open,
			close: obj.close,
			high: obj.high,
			low: obj.low,
			volume: obj.volume,
			volume_quote: obj.volume_quote,
			candle_count: obj.candle_count,
			percent_rise: obj.percent_rise,
			percent_drop: obj.percent_drop,
			close_percent_change: obj.close_percent_change,
			alert: obj.net_prev_close,
			color: obj.color,
		}
	}

	try {

		const result = []

		const fetch_candles = await get_candles(symbol, 1, 30, 0)

		for (let i = 0; i < fetch_candles.length; i++) {

			if (i > 0) {
				let now_candle = fetch_candles[i].close
				let prev_candle = fetch_candles[i - 1].close
				fetch_candles[i].close_percent_change = (now_candle - prev_candle) / prev_candle
			}

		}

		_.each(fetch_candles, function (obj) {
			result.push(map_data(obj))
		})

		return result

	} catch (err) {
		_error('prev_close_by_percentage', err)
	}

}

async function prev_close_all_markets (interval, percent_rise, percent_drop) {

	try {

		const result = []

		const fetch_markets = await xch.fetchMarkets()

		const all_markets = _.map(fetch_markets, function (obj) {
			return {
				symbol: obj.symbol,
				interval: interval,
				from: 10000,
				to: 0,
			}
		})

		await async.each(all_markets, async (candle_params) => {

			const _prev_close = await prev_close_by_percentage(candle_params, percent_rise, percent_drop)

			const _result = _.sortBy(_prev_close, function (obj) {
				return -(obj.timestamp)
			})

			if (_prev_close.length > 0) {

				// log.blue(JSON.stringify(_result[0]))

				result.push(_result[0])

			} else {

				log.red(candle_params.symbol)

			}

		})

		const csv_file_name = `all_markets_by_percentage`

		write_to_cvs(_.reverse(result), csv_file_name)

		return result

	} catch (err) {
		_error('prev_close_all_markets', err)
	}

}

/** Test Initiation Method
 *
 * */
async function test_init () {

	try {
		const market = market_name(candle_params.symbol)

		console.log(market)

		// const _prev_close = await prev_close(candle_params, sequential_count)

		const _prev_close = await prev_close_by_percentage(candle_params, percent_rise, percent_drop)
		log.bright.blue(_prev_close.length)

		const csv_file_name = `${market}_${candle_params.interval}_by_percentage`

		write_to_cvs(_.reverse(_prev_close), csv_file_name)

	} catch (err) {
	  _error('', err)
	}

}

/** Exports ------------
 *
 * */
module.exports = {
	get_candles,
	get_scanner_candles,
	prev_close,
	prev_close_by_percentage,
	prev_close_all_markets,
};

(async function () {

	// await test_init()

	// await all_markets_init()


})()


