// Imports
const log = require('ololog').configure({locate: false})
const ulog = require('util')
const _ = require('lodash')
const Chance = require('chance')
const chance = new Chance()
const async = require('../async')

const axios = require('axios')

const elasticsearch = require('elasticsearch')
const es = new elasticsearch.Client({
	// host: 'localhost:9200',
	// host: 'http://178.128.190.197:9200',
	hosts: [{
		protocol: 'http',
		host: '178.128.190.197',
		port: 9200,
		country: 'US',
		weight: 10
	}],
	log: 'trace'

})

const jsonexport = require('jsonexport');
const fs = require('fs')

const self = this

// Candle Helper Functions */
const _size = 0
const _index = 'hitbtc_1m'
const _type = 'candles'

let update_count = 0

const _url = function (base, quote) {

	return `https://min-api.cryptocompare.com/data/histominute?fsym=${base}&tsym=${quote}&aggregate=1&e=hitbtc`
}

const _interval = function (interval) {
	if (interval) {
		return `${interval}m`
	} else {
		return '1m'
	}
}

const _query = function (query) {
	if (query) {
		return query
	} else {
		return {
			match_all: {}
		}
	}
}

const _date_range = function (from_min, to_min) {

	return {
		bool: {
			filter: [
				{
					range: {
						date: {
							from: `now-${from_min}m`,
							to: `now-${to_min}m`
						}
					}
				}
			]
		}
	}

}

const _smoothing_window = function (interval, smoothing_window) {
	if (interval && smoothing_window) {
		return smoothing_window
	}
	else if (interval && !smoothing_window) {
		return interval
	}
	else {
		return 1
	}
}

const _ma_model = function (ma_model) {
	if (ma_model) {
		return ma_model
	} else {
		return 'ewma'
	}
}

const _alpha = function (alpha) {
	if (alpha) {
		return alpha
	} else {
		return 0.5 // min: 0 - max: 1
	}
}

const _error = function (method, err, socket) {
	log.lightYellow(`${method}__ERROR `, err.message)
	if (socket) {
		socket.emit(`${method}__ERROR `, err.message)
	}
}

// Main Export Candle Methods */
async function moving_avg (interval, smoothing_window, ma_model, alpha, query) {

	try {


		const models = {
			simple: {name: 'simple', cold_start: false},
			linear: {name: 'linear', cold_start: false},
			ewma: {name: 'ewma', cold_start: false},
			holt: {name: 'holt', cold_start: false},
			holt_winters: {
				name: 'holt_winters',
				cold_start: true,
				/**  @holt_winters:  requires two periods of data to "bootstrap" the algorithm. This means that your window must always be at least twice the size of your period. An exception will be thrown if it isn’t. It also means that Holt-Winters will not emit a value for the first 2 * period buckets; the current algorithm does not backcast. */

			},
		}

		let body = {
			size: 0,
			query: _query(query),
			aggs: {

				// INTERVAL */
				'the_interval': {
					date_histogram: {
						field: 'date',
						interval: _interval(interval)
					},

					// CANDLES */
					aggs: {

						// OPEN */
						'the_sum_open': {
							sum: {
								field: 'open'
							}
						},
						'the_movavg_of_the_sum_open': {
							moving_avg: {
								buckets_path: 'the_sum_open',
								window: _smoothing_window(smoothing_window),
								model: _ma_model(ma_model),
								settings: {
									alpha: _alpha(alpha)
								}
							}
						},

						// HIGH */
						'the_sum_high': {
							sum: {
								field: 'high'
							}
						},
						'the_movavg_of_the_sum_high': {
							moving_avg: {
								buckets_path: 'the_sum_high',
								window: _smoothing_window(smoothing_window),
								model: _ma_model(ma_model),
								settings: {
									alpha: _alpha(alpha)
								}
							}
						},

						// LOW */
						'the_sum_low': {
							sum: {
								field: 'low'
							}
						},
						'the_movavg_of_the_sum_low': {
							moving_avg: {
								buckets_path: 'the_sum_low',
								window: _smoothing_window(smoothing_window),
								model: _ma_model(ma_model),
								settings: {
									alpha: _alpha(alpha)
								}
							}
						},

						// CLOSE */
						'the_sum_close': {
							sum: {
								field: 'close'
							}
						},
						'the_movavg_of_the_sum_close': {
							moving_avg: {
								buckets_path: 'the_sum_close',
								window: _smoothing_window(smoothing_window),
								model: _ma_model(ma_model),
								settings: {
									alpha: _alpha(alpha)
								}
							}
						},

						'the_sum_volumefrom': {
							sum: {
								field: 'volumefrom'
							}
						},
						'the_movavg_of_the_sum_volumefrom': {
							moving_avg: {
								buckets_path: 'the_sum_volumefrom',
								window: _smoothing_window(smoothing_window),
								model: _ma_model(ma_model),
								settings: {
									alpha: _alpha(alpha)
								}
							}
						},

						'the_sum_volumeto': {
							sum: {
								field: 'volumeto'
							}
						},
						'the_movavg_of_the_sum_volumeto': {
							moving_avg: {
								buckets_path: 'the_sum_volumeto',
								window: _smoothing_window(smoothing_window),
								model: _ma_model(ma_model),
								settings: {
									alpha: _alpha(alpha)
								}
							}
						}
					}
				}
			}
		}

		return JSON.stringify(body)

	} catch (err) {
		_error('candles_moving_avg', err)
	}

}

async function stats (interval, query) {

	try {

		let body = {
			size: _size,
			query: _query(query),
			aggs: {

				// INTERVAL */
				'the_interval': {
					date_histogram: {
						field: 'date',
						interval: _interval(interval)
					},

					aggs: {

						// OPEN */
						'the_stats_open': {
							stats: {
								field: 'open'
							}
						},

						// HIGH */
						'the_stats_high': {
							stats: {
								field: 'high'
							}
						},

						// LOW */
						'the_stats_low': {
							stats: {
								field: 'low'
							}
						},

						// CLOSE */
						'the_stats_close': {
							stats: {
								field: 'close'
							}
						},

						// VOLUME_FROM */
						'the_stats_volumefrom': {
							stats: {
								field: 'volumefrom'
							}
						},

						// VOLUME_TO */
						'the_stats_volumeto': {
							stats: {
								field: 'volumeto'
							}
						}

					}
				}
			}
		}

		return JSON.stringify(body)

	} catch (err) {
		_error('candles_stats', err)
	}

}

function update_candles (updated_candles) {

	try {

		log.cyan('updated_candles', updated_candles)

		let exchange_name = 'hitbtc'
		let market_name = 'BTC_USD'
		let update_arr = []

		update_arr.push(updated_candles[updated_candles.length-1])
		update_arr.push(updated_candles[updated_candles.length-2])
		update_arr.push(updated_candles[updated_candles.length-3])

		_.each(update_arr, function (candle_obj) {

			(async function () {

				let _id = `${exchange_name}__${market_name}___${candle_obj.timestamp}`

				let exists = await es.exists({
					index: 'hitbtc_candles_btc_usd',
					type: market_name,
					id: _id
				})

				if (!exists) {
					log.lightCyan('new es candle', candle_obj)
					await es.create({
						index: 'hitbtc_candles_btc_usd',
						type: market_name,
						id: _id,
						body: candle_obj
					})
				} else {
					await es.delete({
						index: 'hitbtc_candles_btc_usd',
						type: market_name,
						id: _id
					})
					await es.create({
						index: 'hitbtc_candles_btc_usd',
						type: market_name,
						id: _id,
						body: candle_obj
					})
				}

			})()

		})

	} catch (err) {
		_error('update_candles__ERROR', err)
		resolve('update_candles__ERROR')
	}

}

function _query_candles (interval, from_min, to_min) {

	try {

		let body = {

			size: 0,
			query: _date_range(from_min, to_min),

			// INTERVAL */
			aggs: {
				'the_interval': {
					date_histogram: {
						field: 'date',
						interval: _interval(interval)
					},

					// CANDLES aka Buckets */
					aggs: {

						// OPEN */
						'the_open': {
							top_hits: {
								sort: [{'date': {order: 'asc'}}],
								_source: {
									includes: [
										'date',
										'timestamp',
										'open' //***
									]
								},
								size: 1 // Returns First 1m candle in group with length of (interval)
							}
						},

						// CLOSE */
						'the_close': {
							top_hits: {
								sort: [{'date': {order: 'desc'}}],
								_source: {
									includes: [
										'date',
										'timestamp',
										'close' //***
									]
								},
								size: 1 // Returns Last 1m candle in group with length of (interval)
							}
						},

						// HIGH */
						'the_high': {
							max: {
								field: 'high'
							}
						},

						// LOW */
						'the_low': {
							max: {
								field: 'low'
							}
						},

						// VOLUME_TO */
						'the_volume': {
							sum: {
								field: 'volume'
							}
						}

					}
				}
			}
		}

		return body

	} catch (err) {
		_error('_query_candles', err)
	}

}

function _map_candles(obj, i, info) {

	let _bucket = {}

	if (info) {
		_bucket = obj
	}

	if (obj.doc_count > 0) {
		try {
			return {
				_index: obj.the_open.hits.hits[0]._index,
				_type: obj.the_open.hits.hits[0]._type,
				_id: obj.the_open.hits.hits[0]._id,
				interval: obj.interval,
				doc_count: obj.doc_count,
				key_date: obj.key_as_string,
				key: obj.key,
				timestamp: obj.key,
				high: obj.the_high.value,
				low: obj.the_low.value,
				open: obj.the_open.hits.hits[0]._source.open,
				close: obj.the_close.hits.hits[0]._source.close,
				volume: obj.the_volume.value,
				short: 'SHORT',
				long: 'LONG',
			}
		} catch (err) {
			_error('_map_candles', err)
		}
	}


}

async function candles (interval, min_from, min_to, info) {

	try {

		let _query = _query_candles(interval, min_from, min_to)

		log.black(JSON.stringify(_query))

		let search = await es.search({
			index: _index,
			type: _type,
			body: _query
		})

		let arr = search.aggregations.the_interval.buckets

		let first = _.first(arr)

		if (first.doc_count !== interval) {
			_.remove(arr, function (obj) {
				return obj.key === first.key
			})
		}

		// log.green(JSON.stringify(arr))

		return _.map(arr, function (obj, i) {
			obj.interval = interval
			return _map_candles(obj, i, info)
		})

	} catch (err) {
		_error('candles', err)
	}

}

async function delete_index (index) {
	try {
		return await es.indices.delete({
			index: index
		})

	} catch (err) {
	  _error(`delete_index: ${index}`, err)
	}
}

async function all_indices () {
  try {
	  return await es.cat.indices({
		  format: 'json',
		  h: 'index'
	  })
  } catch (err) {
    _error('all_indices', err)
  }
}

async function delete_indices (arr) {
	try {
		const result = []
		await async.each(arr, async (idx) => {
			const delete_index = await delete_index(idx)
			result.push({
				_index: idx,
				_action: 'deleted',
				success: delete_index.acknowledged,
			})
		})

		log.cyan(result)

		return result

	} catch (err) {
	  _error('delete_indices', err)
	}
}


module.exports = { candles, moving_avg, update_candles }

let dev = true

if (dev) {
	(async function () {

		let res_arr = []

		let INTERVAL = 5
		let FROM_MIN = 1440 // 12 hrs in min
		let TO_MIN = 0 // From NOW
		let SHOW_BUCKET = true // Show aggregated bucket obj candle was built from

		let my_candles = await candles(INTERVAL, FROM_MIN, TO_MIN, SHOW_BUCKET)

		let keys = _.keys(_.first(my_candles))

		log.lightYellow(my_candles.length)
		log.lightRed(JSON.stringify(_.first(my_candles), null, 2))
		log.lightBlue(JSON.stringify(_.last(my_candles), null, 2))

		const order_book = []

		const url_orderbook = `https://api.hitbtc.com/api/2/public/orderbook/BTCUSD`

		const get_orderbook = await axios(url_orderbook)

		const asks = get_orderbook.data.ask
		const bids = get_orderbook.data.bid

		_.each(asks, function (ask) {
			ask.side = 'sell'
			ask.type = 'ask'
			order_book.push(ask)
		})

		_.each(bids, function (bid) {
			bid.side = 'buy'
			bid.type = 'bid'
			order_book.push(bid)
		})

		jsonexport(order_book, function(err, csv){
			if(err) return console.log(err);
			console.log(csv);
		});

	})()
}
