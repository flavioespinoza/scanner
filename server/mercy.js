/** NODE_ENV */
const dotenv = require('dotenv')
dotenv.load()

const env = process.env.NODE_ENV

/** Logs */
require('ansicolor').nice
const log = require('ololog').configure({locate: false})

const http = require('http')
const server = http.createServer()
const fs = require('fs')

/** Tools */
const utils = require('./utils')
const _log = utils._log
const log_error = utils._log_error

const db = require('./db/mongo-db')

/** Helper Functions */
const _ = require('lodash')
const _error = function (method, err, socket) {
	log_error(err)
}

const axios = require('axios')

const sleep = require('util').promisify(setTimeout)

// const instance_id = process.env.pm_id
let instance_id = 0
if (process.env.pm_id) {
	instance_id = process.env.pm_id
}

/** Formatting Functions */
const timeFormat = require('d3-time-format').timeFormat
const formatDate = timeFormat('%b %e, %_I:%M:%S:%L %p')
const formatMin = timeFormat('%M')
const market_name = (symbol) => {
	return _.toLower(symbol.replace('/', '_'))
}

/** Elasticsearch */
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
		console.trace('elasticsearch cluster is down!')
	} else {
		console.log('All is well')
	}
})

/** Websocket & Rest */
const WebSocket = require('ws')
const socketIo = require('socket.io')
const io = socketIo(server)

/** Exchange Auth & Info */
const ccxt = require('ccxt')
const api_key = process.env.HIT_BTC_API_KEY
const secret = process.env.HIT_BTC_SECRET
const exchange_name = 'hitbtc'
const exchange_params = {
	name: exchange_name,
	apiKey: api_key,
	secret: secret,
	nonce: function () {
		return this.milliseconds()
	}
}
const xch = new ccxt.hitbtc2(exchange_params)

const size_of = require('object-sizeof')

/** Candle Data & Markets Options */
const candle_interval_options = {
	'1m': 'M1',
	'3m': 'M3',
	'5m': 'M5',
	'15m': 'M15',
	'30m': 'M30', // default
	'1h': 'H1',
	'4h': 'H4',
	'1d': 'D1',
	'1w': 'D7',
	'1M': '1M'
}

let _interval_int = 1
let _period = candle_interval_options[`${_interval_int}m`]

let all_markets

const logger = {
	debug: (...arg) => {

		// let args = [...arg]
		//
		// let debug = `${(new Date).toISOString()} DEBUG ${args}`
		//
		// console.log(debug.bgRed.black)

	},
	info: (...arg) => {

		let args = [...arg]
		let info = `${(new Date).toISOString()} INFO ${args}`
		console.log(info.bgBlue)

	},
	warn: (...arg) => {

		let args = [...arg]

		log_error(args)

	}
}

/** User Inputs */
const INPUT = {
	_limit: 1000,
	_sleep: 100,
	_sleep_subscribe: 8000,
	_sleep_analyze: 5000
}

let update_es_data = true

let run_integrity_check = false

let update_es_order_book_data = false

function updateIndex (sortedArray, obj, index) {
	if (index < sortedArray.length && sortedArray[index].price === obj.price) {
		if (obj.size === 0) {
			sortedArray.splice(index, 1)
		} else {
			sortedArray[index].size = obj.size
		}
	} else if (obj.size !== 0) {
		sortedArray.splice(index, 0, obj)
	}
	return index === 0
}

function getSortedIndex (array, value, side, best_changed, inverse) {

	let res_balls = []

	inverse = Boolean(inverse)

	let low = 0
	let high = array ? array.length : low

	while (low < high) {
		let mid = (low + high) >>> 1

		if ((!inverse && (+array[mid].price < +value)) || (inverse && (+array[mid].price > +value))) {
			low = mid + 1
		} else {
			high = mid
		}
	}

	if (side === 'ask') {
		// console.log(`${side}: `.bgRed.white, `${JSON.stringify(array[low])}`.red)
		res_balls.push({
			sorted_index: low,
			side: side,
			best: best_changed,
			obj: array[low]
		})

		let ask = array[low]
		ask.best = best_changed

		// log.lightRed(array[low])
	}
	else if (side === 'bid') {
		// console.log(`${side}`.bgBlue.white, `${JSON.stringify(array[low])}`.blue)
		res_balls.push({
			sorted_index: low,
			side: side,
			best: best_changed,
			obj: array[low]
		})

		let bid = array[low]
		bid.best = best_changed

		// log.lightBlue(array[low])
	}

	return low
}


// OrderBook */
let order_book_orders = {}

function _es_order_book_orders (__order_book_orders) {
	(async function () {

		try {

			let arr = []

			_.map(__order_book_orders, function (val, key) {
				arr.push(val)
			})

			order_book_orders = {}

			await utils._each(arr, async (obj) => {

				let __index__ = 'hitbtc_order_book_orders'
				let __type__ = 'order_book_orders'
				let _id = new Date().getTime()

				let es_url = `http://178.128.190.197:9200/${__index__}/${__type__}/${obj.pairing}__${_id}/`

				await axios.post(es_url, obj)
					.then((res) => {

						if (res.data.result === 'updated' || res.data.result === 'created') {
							log.lightYellow(JSON.stringify(res.data, null, 2))
						} else {
							log.lightYellow('-------')
							log.lightYellow('-------')
							log.lightYellow('-------')
							log.cyan('_es_order_book_orders --> axios.then(res) ??? ', JSON.stringify(res.data))
							log.lightYellow('-------')
							log.lightYellow('-------')
							log.lightYellow('-------')
						}

					}).catch((err) => {
						_error('_es_order_book_orders --> axios ', err)
					})

			})

		} catch (err) {
			_error('_es_order_book_new_order', err)
		}

	})()
}

function _es_order_book_new_order (order_book_obj) {
	(async function () {
		try {

			if (update_es_order_book_data) {

				update_es_order_book_data = false

				let __index__ = 'hitbtc_order_book_new_orders'
				let __type__ = 'order_book_new_order'

				let es_url = `http://178.128.190.197:9200/${__index__}/${__type__}/${order_book_obj.id}/`

				await axios.post(es_url, order_book_obj)
					.then((res) => {

						if (res.data.result === 'updated' || res.data.result === 'created') {

						} else {
							log.lightYellow('-------')
							log.lightYellow('-------')
							log.lightYellow('-------')
							log.cyan('_es_order_book_new_order --> axios.then(res) ??? ', JSON.stringify(res.data))
							log.lightYellow('-------')
							log.lightYellow('-------')
							log.lightYellow('-------')
						}

					}).catch((err) => {
						_error('_es_order_book_new_order --> axios ', err)
					})

			}

		} catch (err) {
			_error('_es_order_book_new_order', err)
		}
	})()
}

async function _map_order_book_obj (data, bestChangedAsk, bestChangedBid, symbol, method) {
	try {

		let ask = data.asks.length > 0 ? data.asks[0].price : null
		let bid = data.bids.length > 0 ? data.bids[0].price : null

		// console.log(`${bestChangedBid}: ${bid}`.blue, `${bestChangedAsk}: ${ask}`.red)

		let market = _.find(all_markets, function (obj) {
			return obj.id === symbol
		})

		let _market_name = market_name(market.symbol)

		let timestamp = new Date().getTime()

		let __index__ = 'hitbtc_order_book_new_orders'
		let __type__ = 'order_book_new_order'


		let _id = `${__index__}__${__type__}___${_market_name}____${timestamp}`

		let date = new Date(timestamp)

		return {
			id: _id,
			pairing: symbol,
			symbol: market.symbol,
			market_name: _market_name,
			base: market.base,
			quote: market.quote,
			ask: +ask,
			lowest_ask: bestChangedAsk,
			bid: +bid,
			highest_bid: bestChangedBid,
			timestamp: timestamp,
			date: date,
			date_string: formatDate(timestamp),
			exchange_name: 'hitbtc',
			method: method
		}

	} catch (err) {
		_error('_map_order_book_obj', err)
	}
}

async function _update_order_book (data, asks, bids, symbol, self, method) {
	try {
		if (data) {

			let bestChangedAsk = false
			let bestChangedBid = false

			log.bright.green('----------------------------')
			log.black(symbol)

			asks.forEach(function (__ask) {

				let sorted_index = getSortedIndex(data.asks, __ask.price, 'ask', bestChangedAsk)

				let updated_index = updateIndex(data.asks, __ask, sorted_index)

				if (updated_index) {
					console.log(`${JSON.stringify(__ask)}`.bgRed.black)
					bestChangedAsk = updated_index
				}

			})

			bids.forEach(function (__bid) {

				let sorted_index = getSortedIndex(data.bids, __bid.price, 'bid', bestChangedBid, true)

				let updated_index = updateIndex(data.bids, __bid, sorted_index)

				if (updated_index) {
					console.log(`${JSON.stringify(__bid)}`.bgBlue.black)
					bestChangedBid = true
				}

			});

			// log.red('_asks: ', asks.length)
			// log.blue('_bids: ', bids.length)
			//
			let _order_book_obj = await _map_order_book_obj (data, bestChangedAsk, bestChangedBid, symbol, method)

			bestChangedAsk = false
			bestChangedBid = false

			_es_order_book_new_order(_order_book_obj)

		}

	} catch (err) {
		_error('_update_order_book', err)
	}
}

class OrderBookStore {
	constructor (onChangeBest) {
		this._data = {}
		this._onChangeBest = onChangeBest
	}

	snapshotOrderBook (market, asks, bids) {
		this._data[market.pairing] = {
			asks: asks,
			bids: bids
		}
	}

	updateOrderBook (market, asks, bids) {

		const _self = this

		const _method = 'updateOrderBook'

		if (market) {

			const data = this._data[market.pairing.toString()]

			if (!order_book_orders[market.pairing]) {
				order_book_orders[market.pairing] = {
					asks: 0,
					bids: 0,
					asks_qty: 0,
					bids_qty: 0,
					timestamp: null,
					date: null,
					...market
				}
			}

			// console.log(symbol, '----------------')
			// log.red('__asks__', asks.length)
			// log.blue('__bids__', bids.length)

			let ts = new Date().getTime()

			order_book_orders[market.pairing].asks = _.add(order_book_orders[market.pairing].asks, asks.length)
			order_book_orders[market.pairing].bids = _.add(order_book_orders[market.pairing].bids, bids.length)

			let asks_qty = _.sum(_.map(asks, function (obj) {
				return +obj.size
			}))
			let bids_qty = _.sum(_.map(bids, function (obj) {
				return +obj.size
			}))

			order_book_orders[market.pairing].asks_qty = _.add(order_book_orders[market.pairing].asks_qty, asks_qty)
			order_book_orders[market.pairing].bids_qty = _.add(order_book_orders[market.pairing].bids_qty, bids_qty)
			order_book_orders[market.pairing].timestamp = ts
			order_book_orders[market.pairing].date = new Date(ts)

		}

	}
}


// Trades */
let trades_history = {}

function _es_trades_history (__trades_history) {
	(async function () {

		try {

			let arr = []

			_.map(__trades_history, function (val, key) {
				arr.push(val)
			})

			trades_history = {}

			await utils._each(arr, async (obj) => {

				let __index__ = 'hitbtc_trades_history'
				let __type__ = 'trade'
				let _id = new Date().getTime()

				let es_url = `http://178.128.190.197:9200/${__index__}/${__type__}/trade__${obj.pairing}__${_id}/`

				log.lightBlue(obj)


				await axios.post(es_url, obj)
					.then((res) => {

						if (res.data.result === 'updated' || res.data.result === 'created') {
							// log.lightYellow(JSON.stringify(res.data, null, 2))
						} else {
							log.lightYellow('-------')
							log.lightYellow('-------')
							log.lightYellow('-------')
							log.cyan('_es_trades_history --> axios.then(res) ??? ', JSON.stringify(res.data))
							log.lightYellow('-------')
							log.lightYellow('-------')
							log.lightYellow('-------')
						}

					}).catch((err) => {
						_error('_es_trades_history --> axios ', err)
					})

			})

		} catch (err) {
			_error('_es_trades_history', err)
		}

	})()
}

let es_all_markets = []

class TradesStore {
	constructor (props) {


	}

	snapshotTrades (market, data) {

	}

	updateTrades (market, data) {

		if (market) {

			log.cyan('updateTrades market', market)
			log.blue('updateTrades', market.symbol)
			log.blue('updateTrades', data)

			if (!trades_history[market.symbol]) {
				trades_history[market.symbol] = {...market}
				trades_history[market.symbol].timestamp = null
				trades_history[market.symbol].date = null
				trades_history[market.symbol].sell_qty = 0
				trades_history[market.symbol].buy_qty = 0
				trades_history[market.symbol].sells = 0
				trades_history[market.symbol].buys = 0
			}
			_.each(data, (obj) => {

				let date = obj.timestamp

				trades_history[market.symbol].date = date
				trades_history[market.symbol].timestamp = new Date(date).getTime()

				let qty = +obj.quantity

				if (obj.side === 'sell') {
					trades_history[market.symbol].sells = trades_history[market.symbol].sells + 1
					trades_history[market.symbol].sell_qty = _.add(trades_history[market.symbol].sell_qty, qty)
				}
				else if (obj.side === 'buy') {
					trades_history[market.symbol].buys = trades_history[market.symbol].buys + 1
					trades_history[market.symbol].buy_qty = _.add(trades_history[market.symbol].buy_qty, qty)
				}

			})

			log.magenta(trades_history)

		}

	}


}


// Candles */
class CandleStore {
	constructor (on_update) {
		this._data = {}
		this._onChangeBest = on_update
	}

	async snapshotCandles (market, candles, period, pairing) {

		if (!market) {
			_log.warn(market)
			_log.error(pairing)
			// _log.deep({candles})
			return
		}

		this._data[market.symbol] = { candles: [] }

		let method = 'snapshotCandles'

		let _candles = _.map(candles, function (obj) {
			obj.symbol = market.symbol
			obj.pairing = market.pairing
			obj.pairing_raw = market.pairing_raw
			obj.market_name = market.market_name
			return utils._map_candle(obj, market, method)
		})

		utils._es_snapshot_candles(_candles)

		let len = _candles.length

		let prev = _candles[len - 2]

		let last  = _candles[len - 1]

		this._data[market.symbol] = { candles: [last] }

		let percent_change = await utils._percent_change(last, prev)

		let volume = await utils._get_volume(market)

		let win_loss_2 = await utils._win_loss_ratio(market, 2, method)
		let _win_loss_2 = {
			wins_2: win_loss_2.wins,
			losses_2: win_loss_2.losses
		}

		let win_loss_3 = await utils._win_loss_ratio(market, 3, method)
		let _win_loss_3 = {
			wins_3: win_loss_3.wins,
			losses_3: win_loss_3.losses
		}

		let win_loss_4 = await utils._win_loss_ratio(market, 4, method)
		let _win_loss_4 = {
			wins_4: win_loss_4.wins,
			losses_4: win_loss_4.losses,
			candle_count: win_loss_4.candle_count
		}

		last = Object.assign({}, last, percent_change, volume, _win_loss_2, _win_loss_3, _win_loss_4)

		// log.lightBlue(last)

		if (update_es_data) {

			await utils._es_update_scanner_socket_data(last, market)

		}

		if (run_integrity_check) {
			utils._run_integrity_check(last, market)
		}

	}

	async updateCandles (market, candles, period, pairing) {

		let method = 'updateCandles'

		if (!market) {
			_log.error(pairing)
			return
		}

		let _candles = _.map(candles, function (obj) {
			obj.symbol = market.symbol
			obj.pairing = market.pairing
			obj.pairing_raw = market.pairing_raw
			obj.market_name = market.market_name
			return utils._map_candle(obj, market, method)
		})

		utils._es_snapshot_candles(_candles)

		if (!this._data[market.symbol]) {
			this._data[market.symbol] = { candles: [] }
		}

		let prev = this._data[market.symbol].candles[0]

		let last  = _.last(_candles)

		this._data[market.symbol] = { candles: [last] }

		let percent_change = await utils._percent_change(last, prev)

		let volume = await utils._get_volume(market)

		let win_loss_2 = await utils._win_loss_ratio(market, 2, method)
		let _win_loss_2 = {
			wins_2: win_loss_2.wins,
			losses_2: win_loss_2.losses
		}

		let win_loss_3 = await utils._win_loss_ratio(market, 3, method)
		let _win_loss_3 = {
			wins_3: win_loss_3.wins,
			losses_3: win_loss_3.losses
		}

		let win_loss_4 = await utils._win_loss_ratio(market, 4, method)
		let _win_loss_4 = {
			wins_4: win_loss_4.wins,
			losses_4: win_loss_4.losses,
			candle_count: win_loss_4.candle_count
		}

		last = Object.assign({}, last, percent_change, volume, _win_loss_2, _win_loss_3, _win_loss_4)

		// log.cyan(last)

		if (update_es_data) {

			await utils._es_update_scanner_socket_data(last, market)

		}

		if (run_integrity_check) {
			utils._run_integrity_check(last, market)
		}

	}

}


// WebSocket Client */
class SocketClient {
	constructor (onConnected) {
		this._id = 1
		this._createSocket()
		this._onConnected = onConnected
		this._promises = new Map()
		this._handles = new Map()
	}

	_createSocket () {
		this._ws = new WebSocket('wss://api.hitbtc.com/api/2/ws')
		this._ws.onopen = () => {
			console.log('ws connected'.bgRed)
			this._onConnected()
		}

		this._ws.onclose = () => {

			logger.warn('ws closed')

			let ts = new Date().getTime()

			let closed = {
				_id: `closed__${ts}`,

				timestamp: ts,
				date_string: formatDate(ts),
				method: 'onclose',
				err: null,
				promises: []
			}

			this._promises.forEach((cb, id) => {
				closed.promises.push(id)
				this._promises.delete(id)
				cb.reject(new Error('Disconnected'))
			})

			db.update('ws_logs', closed)

			setTimeout(() => this._createSocket(), 500)

		}

		this._ws.onerror = err => {
			logger.warn('ws error', err)
			let ts = new Date().getTime()
			let error = {
				_id: `closed__${ts}`,
				instance_id: instance_id,
				timestamp: ts,
				date_string: formatDate(ts),
				method: 'onerror',
				err: err,
				promises: []
			}
			db.update('ws_logs', error)
		}
		this._ws.onmessage = msg => {
			logger.debug('<', msg.data)
			try {
				const message = JSON.parse(msg.data)
				if (message.id) {
					if (this._promises.has(message.id)) {
						const cb = this._promises.get(message.id)
						this._promises.delete(message.id)
						if (message.result) {
							cb.resolve(message.result)
						} else if (message.error) {
							cb.reject(message.error)
						} else {
							logger.warn('Unprocessed response', message)
						}
					}
				} else if (message.method && message.params) {
					if (this._handles.has(message.method)) {
						this._handles.get(message.method).forEach(cb => {
							cb(message.params)
						})
					} else {
						logger.warn('Unprocessed method', message)
					}
				} else {
					logger.warn('Unprocessed message', message)
				}
			} catch (e) {
				logger.warn('Fail parse message', e)
			}
		}
	}

	request (method, params = {}) {
		if (this._ws.readyState === WebSocket.OPEN) {
			return new Promise((resolve, reject) => {
				const requestId = ++this._id
				this._promises.set(requestId, {resolve, reject})
				const msg = JSON.stringify({method, params, id: requestId})
				logger.debug('>', msg)
				this._ws.send(msg)
				setTimeout(() => {
					if (this._promises.has(requestId)) {
						this._promises.delete(requestId)
						reject(new Error('Timeout'))
					}
				}, 10000)
			})
		} else {
			return Promise.reject(new Error('WebSocket connection not established'))
		}
	}

	setHandler (method, callback) {
		if (!this._handles.has(method)) {
			this._handles.set(method, [])
		}
		this._handles.get(method).push(callback)
	}
}


const ws_client = new SocketClient(async () => {

	try {

		const viable_markets = await xch.fetchMarkets()

		let _query = utils._query_match_all()

		let _index = 'hitbtc_markets'

		let fetch_markets = await axios.get(utils._es_url(_index, _query))

		let hits = fetch_markets.data.hits.hits

		let source = _.map(hits, (obj) => {
			return obj._source
		})

		all_markets = []

		_.each(viable_markets, (obj) => {

			if (obj.quote === 'BTC' || obj.quote === 'ETH' || obj.quote === 'USDT' || obj.quote === 'USD') {

				let _es_market = _.find(source, function (__obj) {
					return __obj.symbol === obj.symbol
				})

				if (_es_market) {
					es_all_markets.push(_es_market)
					all_markets.push(obj)
				}

			}

		})

		// console.log(es_all_markets)

		const split = utils._split_array(all_markets, 8)

		const my_markets = split[instance_id]

		// log.cyan(instance_id, JSON.stringify(my_markets))

		const es_markets = []

		let len = my_markets.length - 1

		let i = 0

		while (i < len) {

			let _market = my_markets[i]

			console.log(`Subscribe: ${_market.id}`.bgCyan.black)

			await ws_client.request('subscribeCandles', {symbol: _market.id, period: _period, limit: INPUT._limit})

			await ws_client.request('subscribeOrderBook', {symbol: _market.id})

			await ws_client.request('subscribeTrades', {symbol: _market.id})

			await sleep(INPUT._sleep_subscribe)

			i++

		}

	} catch (e) {
		logger.warn(e)
	}

})


// OrderBook Data Handlers */
const orderBooks = new OrderBookStore((symbol, asks, bids) => {
	// log.black(`bid: ${_.round(bestBid, 6)}`.blue, `ask: ${_.round(bestASk, 6)}`.red, symbol)
})
ws_client.setHandler('snapshotOrderbook', async (params) => {
	let _market = {pairing: params.symbol}
	let get_market = _.find(es_all_markets, (obj) => {
	  	return obj.pairing === params.symbol
	})
	if (get_market) {
		_market = get_market
	}
	orderBooks.snapshotOrderBook(_market, params.ask, params.bid)
})
ws_client.setHandler('updateOrderbook', async (params) => {
	let _market = {pairing: params.symbol}
	let get_market = _.find(es_all_markets, (obj) => {
		return obj.pairing === params.symbol
	})
	if (get_market) {
		_market = get_market
	}
	orderBooks.updateOrderBook(_market, params.ask, params.bid)
})

// Trades Data Handlers */
const trades = new TradesStore((symbol, trades) => {

})
ws_client.setHandler('snapshotTrades', async (params) => {
	let _market = {pairing: params.symbol}
	let get_market = _.find(es_all_markets, (obj) => {
		return obj.pairing === params.symbol
	})
	if (get_market) {
		_market = get_market
	}
	trades.snapshotTrades(_market, params.data)
})
ws_client.setHandler('updateTrades', async (params) => {
	let _market = {pairing: params.symbol}
	let get_market = _.find(es_all_markets, (obj) => {
		return obj.pairing === params.symbol
	})
	if (get_market) {
		_market = get_market
	}
	trades.updateTrades(_market, params.data)
})

// Candle Data Handlers */
const candles = new CandleStore((symbol, candles, period) => {
	log.black(symbol, JSON.stringify(candles).lightMagenta, period.bgCyan)
})
ws_client.setHandler('snapshotCandles', async (params) => {
	let _market = await utils._get_market(params.symbol)
	candles.snapshotCandles(_market, params.data, params.period, params.symbol)
})
ws_client.setHandler('updateCandles', async (params) => {
	let _market = await utils._get_market(params.symbol)
	candles.updateCandles(_market, params.data, params.period, params.symbol)
});

let __interval__ = 1

async function _scan_universe (interval) {

	try {

		let _query = utils._query_match_all()

		let _index = 'hitbtc_markets'

		let fetch_markets = await axios.get(utils._es_url(_index, _query))

		let hits = fetch_markets.data.hits.hits

		let all_markets = _.map(hits, (obj) => {
			return obj._source
		})

		let count = 0
		let scan = []

		let split = utils._split_array(all_markets, 8)

		let my_markets = split[instance_id]
		let last_market = _.last(my_markets)
		let recent_market = {}

		await utils._each(my_markets, async (obj) => {
			console.time(`${obj.pairing}`)

			recent_market = obj

			let valid_markets = await utils._scan_market(obj, interval)

			scan.push(valid_markets)

			count++

			console.timeEnd(`${obj.pairing}`)
		})

		let my_markets_length = my_markets.length

		if (last_market.symbol === recent_market.symbol) {

			_log.info(JSON.stringify(scan))

			log.lightYellow({count})
			log.lightCyan({my_markets_length})

			count = 0
			scan = []
			recent_market = {}

			await sleep(15000)

			if (__interval__ === 1) {
				__interval__ = 5
				await _scan_universe(__interval__)
			}
			else if (__interval__ === 5) {
				__interval__ = 15
				await _scan_universe(__interval__)
			}
			else if (__interval__ === 15) {
				__interval__ = 30
				await _scan_universe(__interval__)
			}
			else if (__interval__ === 30) {
				__interval__ = 60
				await _scan_universe(__interval__)
			}
			else if (__interval__ === 60) {
				__interval__ = 240
				await _scan_universe(__interval__)
			}
			else if (__interval__ === 240) {
				__interval__ = 1
				await _scan_universe(__interval__)
			}

		}

	} catch (err) {
		_error('_scan_universe', err)
	}
}

(async function () {

	await _scan_universe(__interval__)

})()

setInterval(() => {
	_es_order_book_orders(order_book_orders)
	_es_trades_history(trades_history)
}, 10000)

/** Server Listen on Port */
let PORT = 7000
if (instance_id) {
	PORT = _.add(7000, _.toNumber(instance_id))
}
server.listen(PORT, () => log.bright.cyan(`hitbtc_candles_socket instance_id: ${instance_id} listening on port ${PORT}`))