// Required
require('ansicolor').nice
const log = require('ololog').configure({locate: false})

const util = require('util')

const _ = require('lodash')

const Chance = require('chance')

const chance = new Chance()

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
	log: ['error']
})

const jsonexport = require('jsonexport')

const fs = require('fs')

const aggs = require('./elasticsearch/aggs/scanner/candles_agg')

const db = require('./db/mongo-db')

const bcrypt = require('bcrypt')


// Consts
const timeFormat = require('d3-time-format').timeFormat

const format_string = '%b %e,%_I:%M:%S:%L %p'

const formatDate = timeFormat(format_string)

const _log = {
	deep: (data) => {
		console.log(util.inspect(data, false, null, true /* enable colors */))
	},
	error: (msg) => {
		console.log(` error: ${msg} `.bgRed.white)
	},
	debug: (msg) => {
		// console.log(` debug: ${msg} `.bgRed.black)
	},
	alert: (msg) => {
		console.log(` alert: ${msg} `.bgYellow.white)
	},
	warn: (msg) => {
		console.log(` warn: ${msg} `.bgMagenta.white)
	},
	info: (msg) => {
		console.log(` info: ${msg} `.bgBlue.white)
	},
	cyan: (msg) => {
		console.log(`${msg} `.bgCyan.white)
	},
	blue: (msg) => {
		console.log(`${msg} `.bgBlue.white)
	},
	red: (msg) => {
		console.log(`${msg} `.bgRed.white)
	},
	yellow: (msg) => {
		console.log(`${msg} `.bgYellow.white)
	},
	assert: (item, item_name) => {
		if (item) {
			let msg = ` SUCCESS: ${item_name} = ${item} `
			console.log(`ASSERT`, msg.bgCyan.black)
		}
		else {
			let msg = ` FAIL: ${item_name} = ${item} `
			console.log(`ASSERT`, msg.bgRed.black)
		}
	},
	timer: (method, method_name) => {
		console.time(`_timer ${method_name}()`)
		method()
		console.timeEnd(`_timer ${method_name}()`)
	}
}

const _sleep = require('util').promisify(setTimeout)

const _time_frames = {

	'1': 'M1',
	'3': 'M3',
	'5': 'M5',
	'15': 'M15',
	'30': 'M30',
	'60': 'H1',
	'240': 'H4',
	'1440': 'D1',

	'1m': 'M1',
	'3m': 'M3',
	'5m': 'M5',
	'15m': 'M15',
	'30m': 'M30',
	'60m': 'H1',
	'240m': 'H4',
	'1440m': 'D1',

	'1h': 'H1',
	'4h': 'H4',
	'1d': 'D1'

}


// ES Filters
const _terms_symbol_filter = function (symbols_ignore_arr) {
	return {
		'filter': {'terms': {'keyword.symbol': symbols_ignore_arr}}
	}
}

const _query_percent_range_exclude = function (prop_name, prop_obj) {

	let _prop_name = {}
	let _range = {
		lt: prop_obj.percent_up,
		gt: prop_obj.percent_down
	}

	_prop_name[prop_name] = _range

	let _query_obj = {
		range: _prop_name
	}

	// _log.deep('_query_percent_range_exclude', _query_obj)

	return _query_obj
}

const _query_percent_change = function (prop_name, percent_change) {

	let _prop_name = {}
	let _range = {}

	if (percent_change === 0) {
		_range = {}
	}
	else if (Math.sign(percent_change) === -1) {
		_range = {
			lte: percent_change
		}
	}
	else if (Math.sign(percent_change) === 1) {
		_range = {
			gte: percent_change
		}
	}

	_prop_name[prop_name] = _range

	let _query_obj = {
		range: _prop_name
	}

	// _log.deep('_query_percent_change', _query_obj)

	return _query_obj

}

const _query_interval = function (interval) {

	let _int = 5

	if (interval) {
		_int = interval
	}

	return {
		term: {
			'interval.keyword': `${_int}m`
		}
	}

}

const _query_symbols = function (symbols_arr) {

	return {
		terms: {
			'symbol.keyword': symbols_arr
		}
	}

}


// Functions
function _alpha_numeric_filter (string) {

	const alpha_numeric = Array.from('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' + ' ')

	const json_string = JSON.stringify(string)

	let filtered_string = ''

	for (let i = 0; i < json_string.length; i++) {

		let char = json_string[i]
		let index = alpha_numeric.indexOf(char)
		if (index > -1) {
			filtered_string += alpha_numeric[index]
		}

	}

	return filtered_string

}

function _most_recent (arr, interval, return_groups) {

	const most_recent = []

	const markets = []

	const groups = _.chain(arr)
		.groupBy('symbol')
		.map((arr_group, symbol) => {

			let sorted = _.sortBy(arr_group, function (obj) {
				return -(obj.timestamp)
			})

			markets.push({
				symbol: symbol,
				count: arr_group.length,
				interval

			})

			most_recent.push(sorted[0])

			return ({
				candles: sorted,
				symbol,
				interval
			})
		})
		.value()

	if (return_groups) {
		return {
			groups,
			most_recent
		}
	} else {
		return most_recent
	}
}

function _interval_integer (interval) {

	let time_frames = {
		'1m': 1,
		'3m': 3,
		'5m': 5,
		'15m': 15,
		'30m': 30,
		'1h': 60,
		'4h': 240,
		'1d': 1440
	}

	return time_frames[interval]

}

function _ROI (initial_investment, total_return, show_percent_sign) {

	let percentage = _.round(((total_return - initial_investment) / initial_investment) * 100, 5)
	if (show_percent_sign) {
		return `${percentage} %`
	} else {
		return percentage
	}

}

function _scanner_get_user_settings (settings) {

	if (!settings) {

		return {
			open_close: true,
			open_high: true,
			open_low: true,

			close_open: true,
			close_high: true,
			close_low: true,

			high_open: true,
			high_close: true,
			high_low: true,

			low_open: true,
			low_close: true,
			low_high: true
		}

	} else {

		return {
			open_close: settings.open_close,
			open_high: settings.open_high,
			open_low: settings.open_low,
			close_open: settings.close_open,
			close_high: settings.close_high,
			close_low: settings.close_low,
			high_open: settings.high_open,
			high_close: settings.high_close,
			high_low: settings.high_low,
			low_open: settings.low_open,
			low_close: settings.low_close,
			low_high: settings.low_high
		}

	}

}

function _scanner_calculate (obj, show_percent_sign) {

	let settings = _scanner_get_user_settings()

	// Open
	let open_close = (settings['open_close']) ? _ROI(obj.open, obj.close, show_percent_sign) : null
	let open_high = (settings['open_high']) ? _ROI(obj.open, obj.high, show_percent_sign) : null
	let open_low = (settings['open_low']) ? _ROI(obj.open, obj.low, show_percent_sign) : null

	// Close
	let close_open = (settings['close_open']) ? _ROI(obj.close, obj.open, show_percent_sign) : null
	let close_high = (settings['close_high']) ? _ROI(obj.close, obj.high, show_percent_sign) : null
	let close_low = (settings['close_low']) ? _ROI(obj.close, obj.low, show_percent_sign) : null

	// High
	let high_open = (settings['high_open']) ? _ROI(obj.high, obj.open, show_percent_sign) : null
	let high_close = (settings['high_close']) ? _ROI(obj.high, obj.close, show_percent_sign) : null
	let high_low = (settings['high_low']) ? _ROI(obj.high, obj.low, show_percent_sign) : null

	// Low
	let low_open = (settings['low_open']) ? _ROI(obj.low, obj.open, show_percent_sign) : null
	let low_close = (settings['low_close']) ? _ROI(obj.low, obj.close, show_percent_sign) : null
	let low_high = (settings['low_high']) ? _ROI(obj.low, obj.high, show_percent_sign) : null

	// Expected return object
	let return_obj_model = {

		market_id: 'USDT-BTC',
		base: 'BTC',
		quote: 'USDT',
		quote_raw: 'USD',
		symbol: 'BTC/USDT',
		pairing: 'BTCUSD',
		pairing_raw: 'BTCUSD',
		market_name: 'btc_usdt',

		date: '2018-12-03T22:15:00.000Z',
		date_string: 'Dec 3, 3:15 PM',
		timestamp: 1543875300000,
		interval: '15m',

		open: 4041.85,
		close: 4032.36,
		high: 4044.830078125,
		low: 4026.47998046875,
		volume: 319,
		volume_quote: 1318128.474609375,

		candle_count: 15,

		// Percent changes
		open_close: -0.23479,
		open_high: 0.07373,
		open_low: -0.38027,
		close_open: 0.23535,
		close_high: 0.30925,
		close_low: -0.14582,
		high_open: -0.07368,
		high_close: -0.3083,
		high_low: -0.45367,
		low_open: 0.38172,
		low_close: 0.14603,
		low_high: 0.45574

	}
	return {
		...obj,
		open_close,
		open_high,
		open_low,
		close_open,
		close_high,
		close_low,
		high_open,
		high_close,
		high_low,
		low_open,
		low_close,
		low_high
	}

}

function _query_match_all (size) {

	let _size = 10000

	if (size) {
		_size = size
	}

	return {
		query: {
			bool: {
				must: [{
					match_all: {}
				}],
				must_not: [],
				should: []
			}
		},
		from: 0,
		size: _size,
		sort: [],
		aggs: {}
	}

}

function _write_to_csv (data, file_name) {

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

function _url (pairing, limit) {
	return `https://api.hitbtc.com/api/2/public/candles/${pairing}?period=M1&sort=ASC&limit=${limit}`
}

function _url_interval (pairing, interval) {

	log.lightYellow({interval})
	let _interval = _time_frames[interval]
	log.lightCyan({_interval})

	return `https://api.hitbtc.com/api/2/public/candles/${pairing}?period=${_interval}&sort=ASC&limit=1000`
}

function _url_interval_limit (pairing, interval) {

	const limit = function (interval) {
		let res
		if (interval <= 3) {
			res = 1000
		} else {
			res = 3600 / interval
		}
		return res
	}

	return `https://api.hitbtc.com/api/2/public/candles/${pairing}?period=${_time_frames[interval]}&sort=ASC&limit=${limit(interval)}`
}

function _url_ticker (pairing) {
	return `https://api.hitbtc.com/api/2/public/ticker/${pairing}`
}

function _es_url (es_index, query) {

	return `http://178.128.190.197:9200/${es_index}/_search?source_content_type=application/json&source=${JSON.stringify(query)}`

}

function _map_candle (obj, market, method) {

	let date_iso = obj.timestamp
	let ts = new Date(obj.timestamp).getTime()
	let date = new Date(ts)
	let date_string = formatDate(ts)

	return {
		symbol: market.symbol,
		market_name: market.market_name,
		timestamp: ts,
		date_iso,
		date,
		date_string,
		open: +obj.open,
		close: +obj.close,
		high: +obj.max,
		low: +obj.min,
		volume: +obj.volume,
		volumeQuote: +obj.volumeQuote,
		pairing: market.pairing,
		pairing_raw: market.pairing_raw,
		base: market.base,
		quote: market.quote
	}

}

function _error (method, err, socket) {
	log.lightYellow(`${method}  ERROR`, err.message)
	if (socket) {
		socket.emit(`${method}__ERROR`, err.message)
	}
}

function _log_error (err_info) {

	let timestamp = new Date().getTime()
	let date = new Date()

	function createError (name, init) {
		function Err (message) {
			Error.captureStackTrace(this, this.constructor)
			this.message = message
			init && init.apply(this, arguments)
		}

		Err.prototype = new Error()
		//set the name property
		Err.prototype.name = name
		// set the constructor
		Err.prototype.constructor = Err

		return Err
	}

	// define new error
	const UnhandledError = createError('Scanner', function (name, invalid) {
		this.message = 'Error: ' + name + 'Reason ' + invalid
	})

	// log & save
	let error = new UnhandledError(date, err_info)
	let stack = error.stack

	log.lightYellow('------------')
	log.lightYellow(date)
	log.lightYellow('------------')
	log.lightYellow(stack)
	log.lightYellow('------------')
	log.cyan({err_info})
	log.cyan('------------')

	// fs.writeFile(`error__${timestamp}.log`, stack, (err) => {
	// 	// throws an error, you could also catch it here
	// 	if (err) log.red(err)
	//
	// 	// success case, the file was saved
	// 	log.bright.cyan(`error__${timestamp}.log saved`)
	// })

}

function _set (arr) {

	return [...new Set(arr)]

}

function _map_order_book (order_book, market, candle_timestamp, candle_date_iso, method_name) {

	let asks = order_book.ask
	let bids = order_book.bid
	let ts_ob = order_book.timestamp
	let ts = candle_timestamp

	let _asks = []
	let _bids = []

	for (let i = 0; i < asks.length; i++) {
		_asks.push({
			price: +asks[i].price,
			qty: +asks[i].size
		})
	}

	for (let i = 0; i < bids.length; i++) {
		_bids.push({
			price: +bids[i].price,
			qty: +bids[i].size
		})

	}

	return {

		asks_count: _asks.length,
		bids_count: _bids.length,

		...market,

		timestamp_order_book: new Date(ts_ob).getTime(),
		date_order_book: order_book.timestamp,

		timestamp: candle_timestamp,
		date: new Date(candle_timestamp),
		date_iso: candle_date_iso,

		method: method_name,

		asks: _asks,
		bids: _bids

	}
}

function _es_update_scanner_order_book () {

}

function _q (prefs) {
	return _query(prefs._to, prefs._from, prefs._percent_props, prefs._interval, prefs._lower_bound, prefs._upper_bound, prefs._symbols_arr, prefs._ignore_list_symbols, prefs._quote_exclude_arr)
}

function _query (to, from, percent_props, interval, lower_bound, upper_bound, symbols_arr, symbols_ignore_arr, exclude_arr) {

	let _must = [

		_query_interval(interval),

		{
			range: {
				volume_quote_btc_24h: {
					gte: lower_bound,
					lte: upper_bound
				}
			}
		},

		{
			range: {
				date: {
					from: `now-${from}m`,
					to: `now-${to}m`
				}
			}
		}

	]

	let _must_not = [{
		terms: {
			'quote.keyword': exclude_arr
		}
	}]

	let _filter = null

	if (!symbols_ignore_arr || symbols_ignore_arr.length === 0) {

	} else {
		let terms = _query_symbols(symbols_ignore_arr)
		_must_not.push(terms)
	}

	if (!symbols_arr || symbols_arr.length === 0) {

	} else {
		_must.push(_query_symbols(symbols_arr))
	}

	(percent_props.open_close.show) ? _must_not.push(_query_percent_range_exclude('open_close', percent_props.open_close)) : null;
	(percent_props.open_high.show) ? _must_not.push(_query_percent_range_exclude('open_high', percent_props.open_high)) : null;
	(percent_props.open_low.show) ? _must_not.push(_query_percent_range_exclude('open_low', percent_props.open_low)) : null;

	(percent_props.close_open.show) ? _must_not.push(_query_percent_range_exclude('close_open', percent_props.close_open)) : null;
	(percent_props.close_high.show) ? _must_not.push(_query_percent_range_exclude('close_high', percent_props.close_high)) : null;
	(percent_props.close_low.show) ? _must_not.push(_query_percent_range_exclude('close_low', percent_props.close_low)) : null;

	(percent_props.high_open.show) ? _must_not.push(_query_percent_range_exclude('high_open', percent_props.high_open)) : null;
	(percent_props.high_close.show) ? _must_not.push(_query_percent_range_exclude('high_close', percent_props.high_close)) : null;
	(percent_props.high_low.show) ? _must_not.push(_query_percent_range_exclude('high_low', percent_props.high_low)) : null;

	(percent_props.low_open.show) ? _must_not.push(_query_percent_range_exclude('low_open', percent_props.low_open)) : null;
	(percent_props.low_close.show) ? _must_not.push(_query_percent_range_exclude('low_close', percent_props.low_close)) : null;
	(percent_props.low_high.show) ? _must_not.push(_query_percent_range_exclude('low_high', percent_props.low_high)) : null

	//TODO: Set Size by interval and date range

	let result = {
		size: 999,
		sort: [
			{date: {order: 'desc'}}
		],
		query: {
			bool: {
				must: _must,
				must_not: _must_not
			}
		}
	}

	return result

}


// Async
async function _hash_password (password) {

	_log.yellow('password', password)

	try {
		const salt = await bcrypt.genSalt(5)

		const hashed_password = await bcrypt.hash(password, salt, null)

		_log.cyan('hashed_password', hashed_password)

		return hashed_password

	} catch (err) {
		_error('_hash_password', err)
	}

}

async function _get_market_info (symbol) {
	try {
		let split = symbol.split('/')
		let _base = split[0]
		let _quote = split[1]
		if (_quote === 'USDT') {
			_quote = 'USD'
		}
		return {
			market_name: _.toLower(symbol.replace('/', '_')),
			base: _base,
			quote: _quote,
			pairing: `${_base}${_quote}`,
			symbol: symbol
		}
	} catch (err) {
		_error('_get_market_info', err)
	}
}

async function _update_user_pref_ignore_list_symbols (data) {
	try {

		let get_prefs = await _get_user_prefs(data.auth_user, {}, null)

		let prefs = get_prefs.data

		prefs._ignore_list_symbols = _set(data.value)

		let _q = _query(prefs._to, prefs._from, prefs._percent_props, prefs._interval, prefs._lower_bound, prefs._upper_bound, prefs._symbols_arr, prefs._ignore_list_symbols, prefs._quote_exclude_arr)

		return {
			_q,
			prefs,
		}

	} catch (err) {
		_error('_update_user_pref_ignore_list_symbols', err)
	}
}

async function _update_user_pref_watchlist_symbols (data) {
	try {

		// _log.info(`${data.name}`)

		// _log.deep(data.value)

		let get_prefs = await _get_user_prefs(data.auth_user, {}, null)

		let prefs = get_prefs.data

		prefs._watchlist_symbols = _set(data.value)

		// log.blue(prefs._watchlist_symbols)

		return {
			prefs,
		}

	} catch (err) {
		_error('_update_user_pref_watchlist_symbols', err)
	}
}

async function _update_user_pref_quote (data) {
	try {

		// _log.info(`percent_prop.${data.name}: ${data.side}`)

		let get_prefs = await _get_user_prefs(data.auth_user, {}, null)

		let prefs = get_prefs.data

		let quote_state = data.quote_state

		prefs._quote_state = quote_state

		let quote_exclude_arr = prefs._quote_exclude_arr

		_.map(quote_state, (val, key) => {
			if (!val) {
		    	quote_exclude_arr.push(_.toUpper(key))
			}
			else {
		    	_.remove(quote_exclude_arr, (str) => {
		    	    return _.toLower(str) === key
		    	})
			}
		})

		prefs._quote_exclude_arr = _set(quote_exclude_arr)

		let _q = _query(prefs._to, prefs._from, prefs._percent_props, prefs._interval, prefs._lower_bound, prefs._upper_bound, prefs._symbols_arr, prefs._ignore_list_symbols, prefs._quote_exclude_arr)

		return {
			_q,
			prefs,
		}

	} catch (err) {
		_error('_update_user_pref_percent_props_show', err)
	}
}

async function _update_user_pref_percent_props_show (data) {
	try {

		_log.info(`percent_prop.${data.name}: ${data.side}`)

		let get_prefs = await _get_user_prefs(data.auth_user, {}, null)

		let prefs = get_prefs.data

		let percent_props = prefs._percent_props

		if (data.side === 'show') {
			percent_props[data.name].show = true
		}
		else if (data.side === 'hide') {
			percent_props[data.name].show = false
		}

		prefs._percent_props = percent_props

		let _q = _query(prefs._to, prefs._from, prefs._percent_props, prefs._interval, prefs._lower_bound, prefs._upper_bound, prefs._symbols_arr, prefs._ignore_list_symbols, prefs._quote_exclude_arr)

		return {
			_q,
			prefs,
		}

	} catch (err) {
		_error('_update_user_pref_percent_props_show', err)
	}
}

async function _update_user_pref_percent_props (data) {
	try {

		_log.info(`percent_prop.${data.name}: ${data.value}`)

		let get_prefs = await _get_user_prefs(data.auth_user, {}, null)

		let prefs = get_prefs.data

		let percent_props = prefs._percent_props

		if (data.side === 'percent_down') {
			percent_props[data.name].percent_down = -(Math.abs(data.value))
		}
		else if (data.side === 'percent_up') {
			percent_props[data.name].percent_up = Math.abs(data.value)
		}

		prefs._percent_props = percent_props

		let _q = _query(prefs._to, prefs._from, prefs._percent_props, prefs._interval, prefs._lower_bound, prefs._upper_bound, prefs._symbols_arr, prefs._ignore_list_symbols, prefs._quote_exclude_arr)

		return {
			_q,
			prefs,
		}

	} catch (err) {
		_error('_update_user_pref_percent_props', err)
	}
}

async function _update_user_pref (data) {
	try {

		_log.info(`${data.name}: ${data.value}`)

		let get_prefs = await _get_user_prefs(data.auth_user, {}, null)

		let prefs = get_prefs.data

		prefs[data.prop] = +data.value

		let _q = _query(prefs._to, prefs._from, prefs._percent_props, prefs._interval, prefs._lower_bound, prefs._upper_bound, prefs._symbols_arr, prefs._ignore_list_symbols, prefs._quote_exclude_arr)

		return {
			_q,
			prefs,
		}

	} catch (err) {
	  	_error('_update_user_pref', err)
	}
}

async function _set_user_prefs_default (user, prefs_default) {

	try {

		return new Promise((resolve) => {
			(async function () {
				const _index = 'user_prefs'

				const _type = 'prefs'

				const _id = `${user.id}__default`

				const _url = `http://178.128.190.197:9200/${_index}/${_type}/${_id}/`

				await axios.post(_url, prefs_default)
					.then((res) => {

						resolve(res)

					}).catch((err) => {
						_error('_set_user_prefs_default --> axios ', err)
					})

			})()
		})

	} catch (err) {
		_error('_set_user_prefs_default', err)
	}

}

async function _set_user_prefs (user, prefs, query_name) {
	try {
		return new Promise((resolve) => {
			(async function () {
				const _index = 'user_prefs'

				const _type = 'prefs'

				let _name = query_name

				if (!query_name) {
					_name = 'default'
				}

				const _id = `${user.id}__${_name}`

				const _url = `http://178.128.190.197:9200/${_index}/${_type}/${_id}/`

				await axios.post(_url, prefs)
					.then((res) => {

						resolve(res)

					}).catch((err) => {
						_error('_set_user_prefs --> axios ', err)
					})
			})()
		})
	} catch (err) {
		_error('_set_user_prefs_default', err)
	}
}

async function _get_user_prefs (user, prefs_default, query_name) {

	// log.yellow(JSON.stringify(prefs_default))

	try {
		return new Promise((resolve) => {
			(async function () {

				let _name = query_name

				if (!query_name) {
					_name = 'default'
				}

				const _id = `${user.id}__${_name}`

				let _query = {
					"query": {
						"ids" : {
							"type" : "prefs",
							"values" : [_id]
						}
					}
				}

				let _url = _es_url('user_prefs', _query)

				let get_prefs = await axios.post(_url)

				if (!get_prefs.data.hits.hits[0]) {

					let set_user_prefs = await _set_user_prefs_default(user, prefs_default)

					resolve({
						success: true,
						data: prefs_default,
						type: 'default',
						query_name: _name
					})
				}
				else {
					resolve({
						success: true,
						data: get_prefs.data.hits.hits[0]._source,
						type: 'existing',
						query_name: _name
					})
				}

			})()
		})

	} catch (err) {
		_error('_get_user_prefs', err)
	}

}

async function _es_update_candles_socket (candle) {

	try {

		let _index = 'hitbtc_candles_socket'

		let _type = 'candle'

		let _id = `hitbtc__${candle.market_name}__${candle.timestamp}`

		let es_url = `http://178.128.190.197:9200/${_index}/${_type}/${_id}/`

		return await axios.post(es_url, candle)
			.then((res) => {

				if (res.data.result === 'updated') {

					// log.blue(JSON.stringify(res.data))
					//
					// return {
					// 	success: true,
					// 	axios: 'updated',
					// 	data: res.data
					// }
				}
				else if (res.data.result === 'created') {
					// log.magenta(JSON.stringify(res.data))
					//
					// return {
					// 	success: true,
					// 	axios: 'created',
					// 	data: res.data
					// }
				}
				else {
					log.red('-------')
					log.lightYellow('_es_update_candles_socket ??? ', JSON.stringify(res.data))
					log.red('-------')
					//
					// return {
					// 	success: false,
					// 	axios: 'error',
					// 	data: null
					// }
				}

			}).catch((err) => {
				_error('_es_update_candles_socket --> axios ', err)
			})

	} catch (err) {
		_error('_es_update_candles_socket', err)
	}

}

async function _es_snapshot_candles (candles) {
	try {

		const result = []

		await _each(candles, async function (obj, i) {
			let update_candle = await _es_update_candles_socket(obj)
			result.push(update_candle)
		})

	} catch (err) {
		_error('_es_snapshot_candles', err)
	}
}

async function _each (arr, callback) {
	for (let i = 0; i < arr.length; i++) {
		await callback(arr[i], i, arr)
	}
}

async function _are_equal (arr) {

	try {
		let len = arr.length
		for (let i = 1; i < len; i++) {
			if (arr[i] === null || arr[i] !== arr[i - 1])
				return false
		}
		return true
	} catch (err) {
		_error('_are_equal', err)
	}

}

async function _compare_sequence (arr, seq_count) {

	try {

		if (!seq_count) {
			seq_count = 3
		}

		let result = []

		await _each(arr, async function (obj, i) {

			if (i === 0 || i === 1) {

			} else {

				let len = seq_count

				let res = []
				let indices = []

				while (len > 0) {
					len--
					let idx = i - len
					indices.push(idx)
					res.push(arr[idx])
				}

				if (await _are_equal(res)) {

					result.push({
						value: res[0],
						indices: indices
					})

				}

			}

		})

		return result

	} catch (err) {
		_error('_compare_sequence', err)
	}

}

async function _es_get_candles (market, interval) {

	try {

		let _query = {
			query: {
				bool: {
					must: [
						{
							term: {
								'market_name.keyword': market.market_name
							}
						},
						{
							range: {
								date: {
									from: `now-1440m`,
									to: `now-0m`
								}
							}
						}
					],
					must_not: [],
					should: []
				}
			},
			from: 0,
			size: 10000,
			sort: [],
			aggs: {}
		}

		// log.lightBlue(JSON.stringify(_query))

		const es_candles = await es.search({
			index: 'hitbtc_candles_socket',
			type: 'candle',
			body: _query,
			size: 10000
		})

		let hits = es_candles.hits.hits

		let candles = _.map(hits, (obj) => {
			return obj._source
		})

		return candles

	} catch (err) {
		_error('_es_get_candles', err)
	}
}

async function _win_loss_ratio (market, seq_count, method) {

	try {

		let _win_loss = {
			market: market.symbol,
			seq_count: seq_count,
			wins: 0,
			losses: 0,
			candle_count: 0,
			success: true
		}

		let candles = await _es_get_candles(market)

		if (candles) {

			_win_loss.candle_count = candles.length

			for (let i = 0; i < candles.length; i++) {

				if (i > 0) {
					let now_candle = candles[i].close
					let prev_candle = candles[i - 1].close
					candles[i].percent_change = (now_candle - prev_candle) / prev_candle
				}
			}

			let map = _.map(candles, function (obj) {
				return Math.sign(obj.percent_change)
			})

			let ratio = await _compare_sequence(map, seq_count)

			for (let i = 0; i < ratio.length; i++) {

				let obj = ratio[i]

				if (obj.value === 1) {
					_win_loss.wins = _win_loss.wins + 1
				}
				else if (obj.value === -1) {
					_win_loss.losses = _win_loss.losses + 1
				}

			}

			return _win_loss

		} else {
			return _win_loss
		}

	} catch (err) {
		_error('_win_loss_ratio', err)
	}

}

async function _percent_change (last, prev) {

	try {

		if (!last || !prev) return

		let decimal = (last.close - prev.close) / prev.close

		let time_gap_ms = last.timestamp - prev.timestamp
		let time_gap_sec = time_gap_ms / 1000
		let time_gap_min = time_gap_ms / 60000

		let num = decimal * 100
		let sign = Math.sign(num)
		let percent_change = num
		let percent_drop = 0
		let percent_rise = 0

		if (sign === -1) {
			percent_drop = Math.abs(num)
		}
		else {
			percent_rise = Math.abs(num)
		}

		return {
			date_last: last.date,
			date_prev: prev.date,
			decimal,
			num,
			percent_change,
			percent_drop,
			percent_rise,
			time_gap_ms,
			time_gap_sec,
			time_gap_min
		}

	} catch (err) {
		_error('_percent_change', err)
	}

}

async function _time_seq_validation (last, prev) {

	try {

		if (!last || !prev) return

		return (Math.sign(last.timestamp - prev.timestamp) === 1)

	} catch (err) {

		_error('_time_seq_validation', err)

	}

}

async function _get_volume (market) {

	try {

		let volume_base_5m = 0
		let volume_base_15m = 0
		let volume_base_24h = 0

		let volume_quote_5m = 0
		let volume_quote_15m = 0
		let volume_quote_24h = 0

		let volume_quote_btc_5m = 0
		let volume_quote_btc_15m = 0
		let volume_quote_btc_24h = 0

		let get_24h = await axios.get(_url_ticker(market.pairing))

		let get_candles = await axios.get(_url(market.pairing, 100))

		let _candles = _.reverse(get_candles.data)

		let len = _candles.length

		let i = 0

		let _5m = 300000

		let _15m = 900000

		let now_ts = new Date().getTime()

		while (i < len) {

			let candle_ts = new Date(_candles[i].timestamp).getTime()

			let volume = _.toNumber(_candles[i].volume)
			let volume_quote = _.toNumber(_candles[i].volumeQuote)

			_candles[i].volume = volume
			_candles[i].volumeQuote = volume_quote

			let _test = now_ts - candle_ts

			if (_test <= _5m) {

				volume_base_5m = _.add(volume_base_5m, _candles[i].volume)
				volume_quote_5m = _.add(volume_quote_5m, _candles[i].volumeQuote)

			}

			if (_test <= _15m) {

				volume_base_15m = _.add(volume_base_15m, _candles[i].volume)
				volume_quote_15m = _.add(volume_quote_15m, _candles[i].volumeQuote)

			}

			if (_test > _15m) {

				volume_base_24h = _.toNumber(get_24h.data.volume)
				volume_quote_24h = _.toNumber(get_24h.data.volumeQuote)

				if (market.quote === 'BTC') {

					volume_quote_btc_5m = volume_quote_5m
					volume_quote_btc_15m = volume_quote_15m
					volume_quote_btc_24h = volume_quote_24h

				}

				if (market.quote === 'ETH') {

					let eth_btc = await axios.get(_url_ticker('ETHBTC'))
					let multiplier = _.toNumber(eth_btc.data.last)

					volume_quote_btc_5m = _.multiply(volume_quote_5m, multiplier)
					volume_quote_btc_15m = _.multiply(volume_quote_15m, multiplier)
					volume_quote_btc_24h = _.multiply(volume_quote_24h, multiplier)

				}

				if (market.quote === 'USD' || market.quote === 'USDT') {

					let btc_usd = await axios.get(_url_ticker('BTCUSD'))
					let multiplier = _.toNumber((1 / btc_usd.data.last))

					volume_quote_btc_5m = _.multiply(volume_quote_5m, multiplier)
					volume_quote_btc_15m = _.multiply(volume_quote_15m, multiplier)
					volume_quote_btc_24h = _.multiply(volume_quote_24h, multiplier)

				}

				return {

					pairing: market.pairing,
					pairing_raw: market.pairing_raw,

					// base
					volume_base_5m,
					volume_base_15m,
					volume_base_24h,

					// quote
					volume_quote_5m,
					volume_quote_15m,
					volume_quote_24h,

					// BTC
					volume_quote_btc_5m,
					volume_quote_btc_15m,
					volume_quote_btc_24h

				}
			}

			i++

		}

	} catch (err) {
		log.bright.red({market})
		_error('_get_volume', err)
	}

}

async function _get_market (string) {

	try {

		let is_symbol = string.includes('/')
		let is_market_name = string.includes('_')

		let _query = {}

		if (is_symbol) {
			_query = {
				query: {
					bool: {
						must: [{
							term: {
								'symbol.keyword': string
							}
						}],
						must_not: [],
						should: []
					}
				},
				from: 0,
				size: 1,
				sort: [],
				aggs: {}
			}
		}
		else if (is_market_name) {
			_query = {
				query: {
					bool: {
						must: [{
							term: {
								'market_name.keyword': string
							}
						}],
						must_not: [],
						should: []
					}
				},
				from: 0,
				size: 1,
				sort: [],
				aggs: {}
			}
		}
		else {
			_query = {
				query: {
					bool: {
						must: [{
							term: {
								'pairing_raw.keyword': string
							}
						}],
						must_not: [],
						should: []
					}
				},
				from: 0,
				size: 1,
				sort: [],
				aggs: {}
			}
		}

		let _url = _es_url('hitbtc_markets', _query)

		let get_market = await axios.post(_url)

		return get_market.data.hits.hits[0]._source

	} catch (err) {
		_error('_get_market', err)
	}

}

async function _get_symbol (pairing) {

	try {

		let _query = {
			query: {
				bool: {
					must: [{
						term: {
							'pairing.keyword': pairing
						}
					}],
					must_not: [],
					should: []
				}
			},
			from: 0,
			size: 1,
			sort: [],
			aggs: {}
		}

		let _url = _es_url('hitbtc_markets', _query)

		let get_market = await axios.post(_url)

		return get_market.data.hits.hits[0]._source.symbol

	} catch (err) {
		_error('_get_symbol', err)
	}

}

async function _get_pairing (symbol) {

	try {
		let _query = {
			query: {
				bool: {
					must: [{
						term: {
							'symbol.keyword': symbol
						}
					}],
					must_not: [],
					should: []
				}
			},
			from: 0,
			size: 1,
			sort: [],
			aggs: {}
		}

		let _url = _es_url('hitbtc_markets', _query)

		let get_market = await axios.post(_url)

		return get_market.data.hits.hits[0]._source.pairing

	} catch (err) {
		_error('_get_pairing', err)
	}

}

async function _integrity_check (market) {

	try {

		let get_candles = await axios.get(_url(market.pairing_raw, 2))

		let candles = get_candles.data

		let _candles = _.map(candles, function (obj) {
			obj.symbol = market.symbol
			obj.pairing = market.pairing
			obj.pairing_raw = market.pairing_raw
			return _map_candle(obj, market)
		})

		let prev = _candles[0]

		let last = _candles[1]

		let percent_change = _percent_change(last, prev)

		let volume = await _get_volume(market)

		last = Object.assign({}, last, percent_change, volume)

		return last

	} catch (err) {
		_error('_integrity_check', err)
	}

}

async function _run_integrity_check (last, market) {

	try {

		let ts = new Date().getTime()

		let sock = last

		let rest = await _integrity_check(market)

		log.lightBlue('snapshotCandles sock', sock)

		log.lightCyan('snapshotCandles rest', rest)

		let sock_string = JSON.stringify(sock)

		let rest_string = JSON.stringify(rest)

		if (sock_string !== rest_string) {
			_log.error(`${market.symbol} Integrity Check FAIL`)
			db.update('data_integrity_logs', {
				_id: ts,
				sock: sock,
				rest: rest
			})
		}
		else {
			_log.info(`${market.symbol} Integrity Check PASS!`)
		}

	} catch (err) {
		_error('_run_integrity_check', err)
	}

}

async function _es_update_scanner_socket_data (last, market) {

	try {

		let _index = 'hitbtc_scanner_socket'

		let _type = 'scanner_socket_data'

		let _id = market.market_name

		let es_url = `http://178.128.190.197:9200/${_index}/${_type}/${_id}/`

		await axios.post(es_url, last)
			.then((res) => {

				if (res.data.result === 'updated') {
					// log.lightMagenta(JSON.stringify(res.data))
				}
				else if (res.data.result === 'created') {
					// log.lightRed(JSON.stringify(res.data))
				}
				else {
					log.red('-------')
					log.lightYellow(JSON.stringify(res.data))
					log.red('-------')
				}

			}).catch((err) => {
				_error(' hitbtc_scanner_socket --> axios ', err)
			})

	} catch (err) {
		_error('_es_update_scanner_socket_data', err)
	}

}

async function _get_scanner_candles (market, interval) {
	try {

		const result = []

		// const api_candles = await axios.get(_url_interval(market.pairing_raw, interval))
		//
		// const es_candles = _.map(api_candles.data, function (obj) {
		// 	return _map_candle(obj, market, '_scanner_candles')
		// })

		const es_candles = await aggs.get_scanner_candles(market, interval, 3600, 0, 'hitbtc_candles_socket', 'candle')

		// log.red(es_candles[1])

		const es_candles_obj_model = {

			id: 'BTC-USDT',
			market_id: 'USDT-BTC',
			base: 'BTC',
			quote: 'USDT',
			quote_raw: 'USD',
			symbol: 'BTC/USDT',
			pairing: 'BTCUSD',
			pairing_raw: 'BTCUSD',
			market_name: 'btc_usdt',

			date: '2018-12-03T22:15:00.000Z',
			date_string: 'Dec 3, 3:15 PM',
			timestamp: 1543875300000,
			interval: '15m',
			open: 4041.85,
			close: 4032.36,
			high: 4044.830078125,
			low: 4026.47998046875,
			volume: 319,
			volume_quote: 1318128.474609375,
			candle_count: 15
		}

		_.each(es_candles, (obj) => {
			result.push(_scanner_calculate(obj, false))
		})

		return result

	} catch (err) {
		_error('_scanner_candles', err)
	}
}

async function _find_first (arr, prop, percent_change) {
	try {
		const sorted = _.sortBy(arr, (obj) => { return -(obj.timestamp)})

		return sorted.find(function (obj) {

			let prop_val = obj[prop]
			let change_val = percent_change

			let prop_sign = Math.sign(prop_val)
			let change_sign = Math.sign(change_val)

			if (prop_sign === -1 && change_sign === -1) {
				return Math.abs(prop_val) >= Math.abs(change_val)
			}
			else if (prop_sign === 1 && change_sign === 1) {
				return prop_val >= change_val
			}

		})

	} catch (err) {
		_error('_find_first', err)
	}
}

async function _get_scanner_volume (market) {
	try {

		const _query = {
			query: {
				bool: {
					must: [{
						term: {
							'symbol.keyword': market.symbol
						}
					}],
					must_not: [],
					should: []
				}
			},
			from: 0,
			size: 10,
			sort: [],
			aggs: {}
		}

		const get_es_scanner_socket = await axios.get(_es_url('hitbtc_scanner_socket', _query))

		let hits

		if (get_es_scanner_socket.data.hits.hits[0]) {

			hits = get_es_scanner_socket.data.hits.hits[0]._source

			return {
				volume_quote_btc_5m: hits.volume_quote_btc_5m,
				volume_quote_btc_15m: hits.volume_quote_btc_15m,
				volume_quote_btc_24h: hits.volume_quote_btc_24h
			}

		} else {

			hits = await _get_volume(market)

			return {
				volume_quote_btc_5m: hits.volume_quote_btc_5m,
				volume_quote_btc_15m: hits.volume_quote_btc_15m,
				volume_quote_btc_24h: hits.volume_quote_btc_24h
			}

		}

	} catch (err) {
		let error = {
			message: `${err.message} -- ${market.symbol}`
		}
		_error('_get_scanner_volume', error)
	}
}

async function _collect_scanner_data (market, interval) {
	try {

		let result = null

		const _scanner_candles = await _get_scanner_candles(market, interval)

		const _scanner_volume = await _get_scanner_volume(market)

		result = _.map(_scanner_candles, (obj) => {
			let _obj = Object.assign({}, obj, _scanner_volume)
			return _obj
		})

		return result

	} catch (err) {
		_error('_collect_scanner_data', err)
	}
}

async function _es_data (market, index, type, es_data) {

	try {

		const _index = index

		const _type = type

		await _each(es_data, async (obj) => {

			const _id = `${_index}__${market.market_name}___${obj.timestamp}`

			const _url = `http://178.128.190.197:9200/${_index}/${_type}/${_id}/`

			obj.id = _id

			await axios.post(_url, obj)
				.then((res) => {

					if (res.data.result === 'updated') {
						// log.lightBlue(JSON.stringify(res.data))
					}
					else if (res.data.result === 'created') {
						// log.lightCyan(JSON.stringify(res.data, null, 2))
					}
					else {
						log.red('-------')
						log.lightYellow(JSON.stringify(res.data, null, 2))
						log.red('-------')
					}

				}).catch((err) => {
					_error('_es_data --> axios ', err)
				})

			await _sleep(1000)

		})

	} catch (err) {
		_error('_es_data', err)
	}

}

async function _scan_market (market, interval) {

	try {

		console.time('scan')

		let result = []

		let _scanner_data = await _collect_scanner_data(market, interval)

		log.lightMagenta(`${market.symbol}...${_scanner_data.length}...${interval}m`)

		const _index = 'hitbtc_scanner_candles'

		const _type = 'scanner_candle'

		await _each(_scanner_data, async (obj) => {

			const _id = `${_index}__${market.market_name}___${obj.timestamp}`

			const _url = `http://178.128.190.197:9200/${_index}/${_type}/${_id}/`

			obj.id = _id

			let put_data = await axios.post(_url, obj)

			let res = put_data.data

			result.push(res)

		})

		return result

		console.timeEnd('scan')

	} catch (err) {
		_error('_scan_markets', err)
	}
}

const _query_vol = (to, from, ignore_symbols) => {

	let _must_not = [{
		terms: {
			'quote.keyword': ['DAI', 'TUSD', 'EURS', 'EOS']
		}
	}]

	if (!ignore_symbols) {

	}
	else if (ignore_symbols.length > 0) {
		_must_not.push({
			terms: {
				'symbol.keyword': ignore_symbols
			}
		})
	}

	return {
		size: 0,
		sort: [{
			date: {
				order: 'desc'
			}
		}],
		query: {
			bool: {
				must: [],
				must_not: _must_not,
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
			the_markets: {
				terms: {
					field: 'market_name.keyword',
					size: 2000,
					show_term_doc_count_error: true
				},
				aggs: {
					the_volume_avg: {
						avg: {
							field: 'volume'
						}
					},
					the_volume_quote_avg: {
						avg: {
							field: 'volumeQuote'
						}
					},
					the_volume_sum: {
						sum: {
							field: 'volume'
						}
					},
					the_volume_quote_sum: {
						sum: {
							field: 'volumeQuote'
						}
					},
					the_symbol: {
						top_hits: {
							sort: [{
								date: {
									order: 'desc'
								}
							}],
							_source: {
								includes: ['timestamp', 'symbol', 'pairing', 'market_name', 'base', 'quote']
							},
							size: 1
						}
					}
				}
			}
		}
	}
}

async function _get_vol (to, from, ignore_symbols) {

	try {

		const _query = _query_vol(to, from, ignore_symbols)

		// log.red(JSON.stringify(_query))

		const es_search = await axios.get(_es_url('hitbtc_candles_socket', _query))

		const es_buckets = es_search.data.aggregations.the_markets.buckets

		// _log.deep(es_buckets.length)
		// _log.deep(es_buckets[0])

		const candles = []

		_.each(es_buckets, function (obj) {

			candles.push(obj)

		})

		return candles

	} catch (err) {
		_error('_get_vol', err)
	}

}

async function _calculate_vol (prefs) {

	try {

		let get_vol_last_1hr = await _get_vol(prefs._vol_last_to, prefs._vol_last_from, prefs._ignore_list_symbols)
		let get_vol_past_60hr = await _get_vol(prefs._vol_past_to, prefs._vol_past_from, prefs._ignore_list_symbols)

		let res = []

		_.each(get_vol_last_1hr, (obj) => {

			let found = _.find(get_vol_past_60hr, (__obj) => {
				return __obj.key === obj.key
			})

			if (found) {


				let market = obj.the_symbol.hits.hits[0]._source

				let candle_count = found.doc_count
				let candle_vacancy_percent = _.round((candle_count / 3600) * 100, 2)


				// Base Coin Volume
				let vol_avg_60hr = found.the_volume_avg.value
				let vol_avg_1hr = obj.the_volume_avg.value
				let vol_percent_diff = _.round((vol_avg_1hr / vol_avg_60hr) * 100, 2)

				let vol_is_2x = (vol_percent_diff >= 200)
				let vol_is_3x = (vol_percent_diff >= 300)
				let vol_is_4x = (vol_percent_diff >= 400)
				let vol_is_5x = (vol_percent_diff >= 500)


				// Quote Coin Volume
				let vol_quote_avg_60hr = found.the_volume_quote_avg.value
				let vol_quote_avg_1hr = obj.the_volume_quote_avg.value
				let vol_quote_percent_diff = _.round((vol_quote_avg_1hr / vol_quote_avg_60hr) * 100, 2)

				let vol_quote_is_2x = (vol_quote_percent_diff >= 200)
				let vol_quote_is_3x = (vol_quote_percent_diff >= 300)
				let vol_quote_is_4x = (vol_quote_percent_diff >= 400)
				let vol_quote_is_5x = (vol_quote_percent_diff >= 500)


				res.push({

					key: obj.key,

					is_watchlist: false,
					is_ignore_list: false,



					vol_avg_60hr,
					vol_avg_1hr,
					vol_percent_diff,

					vol_is_2x,
					vol_is_3x,
					vol_is_4x,
					vol_is_5x,


					vol_quote_avg_60hr,
					vol_quote_avg_1hr,
					vol_quote_percent_diff,

					vol_quote_is_2x,
					vol_quote_is_3x,
					vol_quote_is_4x,
					vol_quote_is_5x,


					candle_count,
					candle_vacancy_percent,

					...market

				})

			}

		})

		return res

	} catch (err) {
		_error('_calculate_vol', err)
	}

}

const _query_obo = (to, from, ignore_symbols) => {

	let _must_not = [{
		terms: {
			'quote.keyword': ['DAI', 'TUSD', 'EURS', 'EOS']
		}
	}]
	if (!ignore_symbols) {

	}
	else if (ignore_symbols.length > 0) {
		_must_not.push({
			terms: {
				'symbol.keyword': ignore_symbols
			}
		})
	}

	return {
		size: 0,
		sort: [{
			date: {
				order: 'desc'
			}
		}],
		query: {
			bool: {
				must: [],
				must_not: _must_not,
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
			the_markets: {
				terms: {
					field: 'market_name.keyword',
					size: 1000,
					show_term_doc_count_error: true
				},
				aggs: {
					the_asks: {
						sum: {
							field: 'asks'
						}
					},
					the_bids: {
						sum: {
							field: 'bids'
						}
					},
					the_asks_qty: {
						sum: {
							field: 'asks_qty'
						}
					},
					the_bids_qty: {
						sum: {
							field: 'bids_qty'
						}
					}
				}
			}
		}
	}

}

async function _get_obo (to, from, ignore_symbols) {

	try {

		const _query = _query_obo(to, from, ignore_symbols)

		// log.red(JSON.stringify(_query))

		const es_search = await axios.get(_es_url('hitbtc_order_book_orders', _query))

		const es_buckets = es_search.data.aggregations.the_markets.buckets

		// _log.deep(es_buckets.length)
		// _log.deep(es_buckets[0])

		const orders = []

		_.each(es_buckets, function (obj) {

			orders.push(obj)

		})

		return orders

	} catch (err) {
		_error('_get_order_book_orders', err)
	}

}

async function _calculate_obo (prefs) {

	try {

		let get_obo_last_1hr = await _get_obo(prefs._obo_last_to, prefs._obo_last_from, prefs._ignore_list_symbols)
		let get_obo_past_4hr = await _get_obo(prefs._obo_past_to, prefs._obo_past_from, prefs._ignore_list_symbols)

		let res = []

		_.each(get_obo_last_1hr, (obj) => {

			let found = _.find(get_obo_past_4hr, (__obj) => {
				return __obj.key === obj.key
			})

			let found_obj_model = {
				key: 'xaur_btc',
				doc_count: 1,
				doc_count_error_upper_bound: 0,
				the_asks_qty: {
					value: 1
				},
				the_bids_qty: {
					value: 0
				},
				the_bids: {
					value: 0
				},
				the_asks: {
					value: 2
				}
			}

			if (found) {

				// _log.deep(found)

				let candle_count = found.doc_count
				let candle_vacancy_percent = _.round((candle_count / 3600) * 100, 2)

				let bids_past_4hr = found.the_bids.value
				let bids_qty_past_4hr = found.the_bids_qty.value

				let asks_past_4hr = found.the_asks.value
				let asks_qty_past_4hr = found.the_asks_qty.value

				let bids_past_1hr = obj.the_bids.value
				let bids_qty_past_1hr = obj.the_asks_qty.value

				let asks_past_1hr = obj.the_asks.value
				let asks_qty_past_1hr = obj.the_asks.value

				let bids_percent_diff = _.round((bids_past_1hr / bids_past_4hr) * 100, 2)
				let asks_percent_diff = _.round((asks_past_1hr / asks_past_4hr) * 100, 2)

				let bids_qty_percent_diff = _.round((bids_qty_past_1hr / bids_qty_past_4hr) * 100, 2)
				let asks_qty_percent_diff = _.round((asks_qty_past_1hr / asks_qty_past_4hr) * 100, 2)

				let bids_is_50 = (bids_percent_diff >= 50)
				let bids_is_1x = (bids_percent_diff >= 100)
				let bids_is_2x = (bids_percent_diff >= 200)
				let bids_is_3x = (bids_percent_diff >= 300)
				let bids_is_4x = (bids_percent_diff >= 400)
				let bids_is_5x = (bids_percent_diff >= 500)

				let asks_is_50 = (asks_percent_diff >= 50)
				let asks_is_1x = (asks_percent_diff >= 100)
				let asks_is_2x = (asks_percent_diff >= 200)
				let asks_is_3x = (asks_percent_diff >= 300)
				let asks_is_4x = (asks_percent_diff >= 400)
				let asks_is_5x = (asks_percent_diff >= 500)

				let bids_qty_is_50 = (bids_qty_percent_diff >= 50)
				let bids_qty_is_1x = (bids_qty_percent_diff >= 100)
				let bids_qty_is_2x = (bids_qty_percent_diff >= 200)
				let bids_qty_is_3x = (bids_qty_percent_diff >= 300)
				let bids_qty_is_4x = (bids_qty_percent_diff >= 400)
				let bids_qty_is_5x = (bids_qty_percent_diff >= 500)

				let asks_qty_is_50 = (asks_qty_percent_diff >= 50)
				let asks_qty_is_1x = (asks_qty_percent_diff >= 100)
				let asks_qty_is_2x = (asks_qty_percent_diff >= 200)
				let asks_qty_is_3x = (asks_qty_percent_diff >= 300)
				let asks_qty_is_4x = (asks_qty_percent_diff >= 400)
				let asks_qty_is_5x = (asks_qty_percent_diff >= 500)

				res.push({

					key: obj.key,
					market_name: obj.key,

					bids_past_4hr,
					bids_qty_past_4hr,

					asks_past_4hr,
					asks_qty_past_4hr,

					bids_past_1hr,
					bids_qty_past_1hr,

					asks_past_1hr,
					asks_qty_past_1hr,

					bids_percent_diff,
					asks_percent_diff,

					bids_qty_percent_diff,
					asks_qty_percent_diff,

					bids_is_50,
					bids_is_1x,
					bids_is_2x,
					bids_is_3x,
					bids_is_4x,
					bids_is_5x,

					asks_is_50,
					asks_is_1x,
					asks_is_2x,
					asks_is_3x,
					asks_is_4x,
					asks_is_5x,

					bids_qty_is_50,
					bids_qty_is_1x,
					bids_qty_is_2x,
					bids_qty_is_3x,
					bids_qty_is_4x,
					bids_qty_is_5x,

					asks_qty_is_50,
					asks_qty_is_1x,
					asks_qty_is_2x,
					asks_qty_is_3x,
					asks_qty_is_4x,
					asks_qty_is_5x,

					doc_count: found.doc_count,

					is_ignore_list: false,

					is_watchlist: false

				})

			}

		})

		// _log.deep(res)

		return res

	} catch (err) {
		_error('_calculate_order_book_orders', err)
	}

}

const _query_trades_history = (to, from, ignore_symbols) => {

	let _must_not = [{
		terms: {
			'quote.keyword': ['DAI', 'TUSD', 'EURS', 'EOS']
		}
	}]
	if (!ignore_symbols) {

	}
	else if (ignore_symbols.length > 0) {
		_must_not.push({
			terms: {
				'symbol.keyword': ignore_symbols
			}
		})
	}

	return {
		size: 0,
		sort: [{
			date: {
				order: 'desc'
			}
		}],
		query: {
			bool: {
				must: [],
				must_not: _must_not,
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
			the_markets: {
				terms: {
					field: 'market_name.keyword',
					size: 2000,
					show_term_doc_count_error: true
				},
				aggs: {
					the_buys: {
						sum: {
							field: 'buys'
						}
					},
					the_sells: {
						sum: {
							field: 'sells'
						}
					},
					the_buy_qty: {
						sum: {
							field: 'buy_qty'
						}
					},
					the_sell_qty: {
						sum: {
							field: 'sell_qty'
						}
					},
					the_symbol: {
						top_hits: {
							sort: [{
								date: {
									order: 'desc'
								}
							}],
							_source: {
								includes: ['date', 'timestamp', 'symbol', 'pairing', 'market_name', 'base', 'quote']
							},
							size: 1
						}
					}
				}
			}
		}
	}

}

async function _get_trades_history (to, from, ignore_symbols) {

	try {

		const _query = _query_trades_history(to, from, ignore_symbols)

		// log.black(JSON.stringify(_query))

		const es_search = await axios.get(_es_url('hitbtc_trades_history', _query))

		const es_buckets = es_search.data.aggregations.the_markets.buckets

		let res = _.map(es_buckets, (obj) => {

			let market = obj.the_symbol.hits.hits[0]._source

			return {
				key: obj.key,
				sells: obj.the_sells.value,
				buys: obj.the_buys.value,
				buys_qty: obj.the_buy_qty.value,
				sells_qty: obj.the_sell_qty.value,
				...market
			}

		})

		// console.log(res)

		return res

	} catch (err) {
		_error('_get_trades_history', err)
	}

}

async function _calculate_trades_history (prefs) {

	try {

		let get_trades_last_1hr  = await _get_trades_history(prefs._get_trades_last_to, prefs._get_trades_last_from, prefs._ignore_list_symbols)
		let get_trades_past_30hr = await _get_trades_history(prefs._get_trades_past_to, prefs._get_trades_past_from, prefs._ignore_list_symbols)

		let res = []

		_.each(get_trades_last_1hr, (obj) => {

			let found = _.find(get_trades_past_30hr, (__obj) => {
				return __obj.key === obj.key
			})

			if (found) {

				found.date = Date(found.timestamp)

				let candle_count = found.doc_count
				let candle_vacancy_percent = _.round((candle_count / 1800) * 100, 2)

				let buys_past_30hr = found.buys
				let sells_past_30hr = found.sells

				let buys_past_1hr = obj.buys
				let sells_past_1hr = obj.sells

				let buys_qty_30hr = found.buys_qty
				let sells_qty_30hr = found.sells_qty

				let buys_qty_1hr = obj.buys_qty
				let sells_qty_1hr = obj.sells_qty

				let buys_percent_diff = _.round((buys_past_1hr / buys_past_30hr) * 100, 2)
				let sells_percent_diff = _.round((sells_past_1hr / sells_past_30hr) * 100, 2)

				let buys_qty_percent_diff = _.round((buys_qty_1hr / buys_qty_30hr) * 100, 2)
				let sells_qty_percent_diff = _.round((sells_qty_1hr / sells_qty_30hr) * 100, 2)

				let buys_is_50 = (buys_percent_diff >= 50)
				let buys_is_1x = (buys_percent_diff >= 100)
				let buys_is_2x = (buys_percent_diff >= 200)

				let sells_is_50 = (sells_percent_diff >= 50)
				let sells_is_1x = (sells_percent_diff >= 100)
				let sells_is_2x = (sells_percent_diff >= 200)

				let buys_qty_is_50 = (buys_qty_percent_diff >= 50)
				let buys_qty_is_1x = (buys_qty_percent_diff >= 100)
				let buys_qty_is_2x = (buys_qty_percent_diff >= 200)

				let sells_qty_is_50 = (sells_qty_percent_diff >= 50)
				let sells_qty_is_1x = (sells_qty_percent_diff >= 100)
				let sells_qty_is_2x = (sells_qty_percent_diff >= 200)

				res.push({

					key: obj.key,
					symbol: obj.symbol,
					pairing: obj.pairing,
					market_name: obj.market_name,
					quote: obj.quote,
					base: obj.base,

					candle_count,
					candle_vacancy_percent,

					buys_past_30hr,
					sells_past_30hr,

					buys_past_1hr,
					sells_past_1hr,

					buys_qty_30hr,
					sells_qty_30hr,

					buys_qty_1hr,
					sells_qty_1hr,

					buys_percent_diff,
					sells_percent_diff,

					buys_qty_percent_diff,
					sells_qty_percent_diff,

					buys_is_50,
					buys_is_1x,
					buys_is_2x,

					sells_is_50,
					sells_is_1x,
					sells_is_2x,

					buys_qty_is_50,
					buys_qty_is_1x,
					buys_qty_is_2x,

					sells_qty_is_50,
					sells_qty_is_1x,
					sells_qty_is_2x,

				})

			}

		})

		return res

	} catch (err) {
		_error('_calculate_trades_history', err)
	}

}

async function _uniq_all_props (__arr1, __arr2) {
	let arr = __arr1.concat(__arr2)
	console.log('arr.length', arr.length)
	let set = []
	let result = []
	arr.forEach(function (__obj) {
		/** Set each obj to a string. */
		let string = JSON.stringify(__obj)
		set.push(string)
	})
	set.filter(function (elem, index, self) {
		/** Use filter as a loop to push onto results array.
		 * This is done to preserve prop types from original arrays */
		if (index === self.indexOf(elem)) {
			result.push(arr[index])
		}
	})
	return result
}

const _split_array = (array, chunks) => {
    return _.reduce(_.range(chunks), ({array, result, chunks}, chunkIndex) => {
        const numItems = Math.ceil(array.length / chunks)
        const items = _.take(array, numItems)
        result.push(items)
        return {
            array: _.drop(array, numItems),
            result,
            chunks: chunks - 1
        }
    }, {
        array,
        result: [],
        chunks
    }).result

}

const _format_date = (format_string) => {
    return timeFormat(format_string)
}

const _toFixed = (__number, __digits, __min, __max, __is_balance) => {

    let digits

    const sign = Math.sign(__number)

    if (!__number) {
        return 0
    } else if (__is_balance && __number < 0.000001) {
        return 0
    } else {
        if (__min && __max) {
            if (__number > 1) {
                digits = __min
            } else {
                digits = __max
            }
        } else if (__digits) {
            digits = __digits
        } else {
            if (__number > 1) {
                digits = 2
            } else {
                digits = 10
            }
        }

        const reg_ex = new RegExp('(\\d+\\.\\d{' + digits + '})(\\d)')

        const number = __number.toString()

        const array = number.match(reg_ex)

        const result = array ? parseFloat(array[1]) : __number.valueOf()

        if (sign === -1) {
            return -result
        } else {
            return result
        }

    }
}

// Exports
module.exports = {

	_log,

	_sleep,

	_time_frames,

	_hash_password,

	_set,

	_update_user_pref_ignore_list_symbols,

	_update_user_pref_watchlist_symbols,

	_update_user_pref_quote,

	_update_user_pref_percent_props_show,

	_update_user_pref_percent_props,

	_q,

	_query,

	_update_user_pref,

	_set_user_prefs,

	_set_user_prefs_default,

	_get_user_prefs,

	_alpha_numeric_filter,

	_query_trades_history,

	_get_trades_history,

	_calculate_trades_history,

	_query_obo,

	_get_obo,

	_calculate_obo,

	_query_vol,

	_get_vol,

	_calculate_vol,

	_terms_symbol_filter,

	_query_percent_range_exclude,

	_query_percent_change,

	_query_symbols,

	_query_interval,

	_query_match_all,

	_map_order_book,

	_es_update_scanner_order_book,

	_url_interval,

	_url_interval_limit,

	_interval_integer,

	_most_recent,

	_scan_market,

	_write_to_csv,

	_uniq_all_props,

	_es_snapshot_candles,

	_each,

	_are_equal,

	_compare_sequence,

	_win_loss_ratio,

	_time_seq_validation,

	_get_volume,

	_get_market,

	_get_symbol,

	_get_pairing,

	_log_error,

	_es_update_scanner_socket_data,

	_run_integrity_check,

	_integrity_check,

	_percent_change,

	_map_candle,

	_url,

	_es_url,

	_split_array,

	_format_date,

    _error,
    
	_toFixed,

}

// log.blue(JSON.stringify(_query_obo(0, 3660, ['ADA/BTC'])))