const dotenv = require('dotenv')
dotenv.load()

const utils = require('./utils')
const _log = utils._log
const log = require('ololog').configure({locate: false})
const _ = require('lodash')
const axios = require('axios')

const _error = function (method, err, socket) {
	log.lightYellow(`${method}__ERROR`, err.message)
	if (socket) {
		socket.emit(`${method}__ERROR`, err.message)
	}
}

let _symbols_arr = []

// ES Constant
/**
 * @param {{_index:string}} ES main index
 * */
const _index = 'hitbtc_scanner_candles'
/**
 * @param {{_from:integer}} furthest date range boundary => number of minutes in the past
 * */
let _from = 3600
/**
 * @param {{_to:integer}} nearest date range boundry => number of minutes closest to now.
 * */
let _to = 0

// ES FILTER PARAMS
/**
 * @param {{_interval:number}} main candle interval
 * */
let _interval = 5

/**
 * @param {{_percent_props:object}} percent change filters
 * */
let _percent_props = {

	open_close: {
		prop_name: 'open_close',
		percent_up: 1,
		percent_down: -1,
		show: true
	},
	open_high: {
		prop_name: 'open_high',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},
	open_low: {
		prop_name: 'open_low',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},

	close_open: {
		prop_name: 'close_open',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},
	close_high: {
		prop_name: 'close_high',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},
	close_low: {
		prop_name: 'close_low',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},

	high_open: {
		prop_name: 'high_open',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},
	high_close: {
		prop_name: 'high_close',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},
	high_low: {
		prop_name: 'high_low',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},

	low_open: {
		prop_name: 'low_open',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},
	low_close: {
		prop_name: 'low_close',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},
	low_high: {
		prop_name: 'low_high',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	}

}

/**
 * @param {{_quote_exclude_arr:array}} list of quote coin markets to exclude
 * */
let _quote_exclude_arr = ['DAI', 'TUSD', 'EURS', 'EOS']

/**
 * @param {{_upper_bound:number}} upper range boundary of BTC volume for past 24hrs
 * */
let _upper_bound = 60001
/**
 * @param {{_lower_bound:number}} lower range boundary of BTC volume for past 24hrs
 * */
let _lower_bound = 1

/**
 * @param {{:}}
 * */
let _quote = []
let _quote_state = {btc: true, usdt: true, eth: true}

// IGNORE LIST
let _ignore_list_symbols = ['LTC/USDT', 'BMC/USDT']
let _show_ignore_list = false

// WATCHLIST
let _watchlist_symbols = ['BTC/USDT', 'ETH/USDT']
let _show_watchlist = false

let _min = 0
let _max = 70000



const user_prefs_default = {

	// list symbols
	_watchlist_symbols,
	_ignore_list_symbols,


	// Compound Data Prefs
	_is_2x_obo: 2,
	_is_2x: 2,

	_vol_last_to: 0,
	_vol_last_from: 60,

	_vol_past_to: 60,
	_vol_past_from: 3600,

	_obo_last_to: 0,
	_obo_last_from: 60,

	_obo_past_to: 60,
	_obo_past_from: 240,

	_get_trades_last_to: 0,
	_get_trades_last_from: 60,

	_get_trades_past_to: 60,
	_get_trades_past_from: 1860,


	// Simple Data Prefs
	_to,
	_from,

	_percent_props,

	_interval,

	_lower_bound,
	_upper_bound,

	_show_watchlist,
	_show_ignore_list,

	_quote_state,

	_min,
	_max,


	// Other Prefs
	_quote_exclude_arr,
	_quote,
	_symbols_arr,


}



// MARKET INFO - SINGLE MARKET
async function es_market_info (market, prefs) {
	try {

		prefs._symbols_arr[market.symbol]

		let _q = utils._q(prefs)

		let _url = utils._es_url(_index, _q)

		const scanner = await axios.post(_url)

		const hits = scanner.data.hits.hits

		const hits_total = scanner.data.hits.total

		const source = _.map(hits, (obj) => {
			return obj._source
		})

		return _.sortBy(source, (obj) => {
			return obj.timestamp
		})

	} catch (err) {
		_error('es_market_info', err)
	}
}

async function api_market_info (market) {
	try {
		let _url = utils._url_interval(market.pairing, market.interval)
		let get_candles = await axios.get(_url)
		let raw_data = get_candles.data
		let candle_data = []
		_.each(raw_data, function (obj) {
			candle_data.push(utils._map_candle(obj, market, 'market_info'))
		})
		return _.sortBy(candle_data, (obj) => {
			return obj.timestamp
		})
	} catch (err) {
		_error('api_market_info', err)
	}
}



// IGNORE_LISTS - CURRENT
const _query_ignore_list = (ignore_list_symbol) => {

	return {
		query: {
			bool: {
				must: [{
					terms: {
						'symbol.keyword': ignore_list_symbol
					}
				}],
				must_not: [],
				should: []
			}
		},
		from: 0,
		size: 2000,
		sort: [],
		aggs: {}
	}

}

async function es_ignore_list (query) {

	try {

		let _idx = 'hitbtc_scanner_socket'

		let _url = utils._es_url(_idx, query)

		let scanner = await axios.post(_url)

		let hits = scanner.data.hits.hits

		let hits_total = scanner.data.hits.total

		let source = _.map(hits, (obj) => {
			return obj._source
		})

		let ignore_list = _.map(source, (obj) => {
			obj.is_ignore_list = true
			return obj
		})

		return _.sortBy(ignore_list, (obj) => {
			return -(obj.timestamp)
		})

	} catch (err) {
		_error('es_ignore_list', err)
	}

}

async function gather_ignore_list (ignore_list_symbols) {

	try {

		let _q = _query_ignore_list(ignore_list_symbols)

		let _get_ignore_list = await es_ignore_list(_q)

		return _.sortBy(_get_ignore_list, (obj) => {
			return obj.symbol
		})

	} catch (err) {
		_error('gather_ignore_list', err)
	}

}



// WATCHLIST - CURRENT
const _query_watchlist = (watchlist_symbols) => {

	return {
		query: {
			bool: {
				must: [{
					terms: {
						'symbol.keyword': watchlist_symbols
					}
				}],
				must_not: [],
				should: []
			}
		},
		from: 0,
		size: 1000,
		sort: [],
		aggs: {}
	}

}

async function es_watchlist (query) {

	try {

		let _idx = 'hitbtc_scanner_socket'

		let _url = utils._es_url(_idx, query)

		let scanner = await axios.post(_url)

		let hits = scanner.data.hits.hits

		let hits_total = scanner.data.hits.total

		let source = _.map(hits, (obj) => {
			return obj._source
		})

		return _.sortBy(source, (obj) => {
			return obj.timestamp
		})

	} catch (err) {
		_error('es_watchlist', err)
	}

}

async function gather_watchlist (watchlist_symbols) {

	try {

		let _q = _query_watchlist(watchlist_symbols)

		let _get_watchlist = await es_watchlist(_q)

		return _.sortBy(_get_watchlist, (obj) => {
			return obj.symbol
		})

	} catch (err) {
		_error('gather_watchlist', err)
	}

}



// ALL MARKETS
const _query_all_markets = function () {

	return {
		query: {
			bool: {
				must: [],
				must_not: [],
				should: []
			}
		},
		from: 0,
		size: 2000,
		sort: [],
		aggs: {}
	}

}

async function _all_markets () {

	try {

		let _idx = 'hitbtc_scanner_socket'

		let _q = _query_all_markets()

		let _url = utils._es_url(_idx, _q)

		let scanner = await axios.post(_url)

		let hits = scanner.data.hits.hits

		let all_hits = _.map(hits, (obj) => {

			return obj._source

		})


		// Data to send
		const all_markets = _.sortBy(all_hits, (obj) => {

			return -(obj.timestamp)

		})

		return all_markets

	} catch (err) {
		_error('_all_markets', err)
	}

}



// SIMPLE LIST DATA
async function get_simple_data (prefs, _q) {

	try {

		// Gather Data
		let _url = utils._es_url(_index, _q)

		let scanner = await axios.post(_url)

		let hits = scanner.data.hits.hits

		let all_hits = []

		_.each(hits, function (obj) {

			if (obj._source.symbol) {

				all_hits.push(obj._source)

			}

		})

		let recent = utils._most_recent(all_hits, prefs._interval, true)

		// Data to Send
		let items = recent.most_recent

		let volume_quote_btc_24h = _.map(items, function (obj) {
			return obj.volume_quote_btc_24h
		})

		let max = _.max(volume_quote_btc_24h)

		let _max = _.add(Math.floor(max), 5000)

		if (!_lower_bound) {
			prefs._lower_bound = 0
		}

		if (!_upper_bound) {
			prefs._upper_bound = _max + 1000
		}

		prefs._min = 0
		prefs._max = _max

		for (let i = 0; i < items.length; i++) {

			if (prefs._watchlist_symbols.includes(items[i].symbol)) {
				items[i].is_watchlist = true
			}
			else {
				items[i].is_watchlist = false
			}

			if (prefs._ignore_list_symbols.includes(items[i].symbol)) {
				items[i].is_ignore_list = true
			}
			else {
				items[i].is_ignore_list = false
			}
		}

		// Result
		return {
			items: items,
			prefs: prefs,
		}

	} catch (err) {
		_error('get_simple_data', err)
	}

}

function io_simple_data (_q, socket, prefs) {
	(async function () {

		try {

			let simple_data = await get_simple_data(prefs, _q)

			if (!simple_data) {
				return
			}
			else if (simple_data.items && simple_data.items.length > 0) {
				socket.emit('simple_data', simple_data)
			}

		} catch (err) {
			_error('io_simple_data', err)
		}

	})()
}



// COMPOUND LIST DATA
async function get_compound_data (prefs) {

	try {

		let get_items = await utils._calculate_vol(prefs)
		let get_obo = await utils._calculate_obo(prefs)
		let get_trades = await utils._calculate_trades_history(prefs)

		let items_compound = []

		_.each(get_items, function (obj) {

			_.each(prefs._watchlist_symbols, (sym) => {

				if (sym === obj.symbol) {

					obj.is_watchlist = true

				}
				else {

					obj.is_watchlist = false

				}

			})

			_.each(prefs._ignore_list_symbols, (sym) => {

				if (sym === obj.symbol) {

					obj.is_ignore_list = true

				}
				else {

					obj.is_ignore_list = false

				}
			})

			let obo = _.find(get_obo, (order_book_order) => {

				return order_book_order.market_name === obj.market_name

			})

			let trades = _.find(get_trades, (trade) => {

				return trade.market_name === obj.market_name

			})

			let res = {
				...obj,
				...obo,
				...trades
			}

			items_compound.push(res)

		})

		for (let i = 0; i < items_compound.length; i++) {

			if (prefs._watchlist_symbols.includes(items_compound[i].symbol)) {
				items_compound[i].is_watchlist = true
			}
			else {
				items_compound[i].is_watchlist = false
			}

			if (prefs._ignore_list_symbols.includes(items_compound[i].symbol)) {
				items_compound[i].is_ignore_list = true
			}
			else {
				items_compound[i].is_ignore_list = false
			}
		}

		return {
			items_compound: items_compound,
			prefs: prefs,
		}

	} catch (err) {
		_error('get_compound_data', err)
	}

}

function io_compound_data (socket, prefs) {
	(async function () {
		try {
			let compound_data = await get_compound_data(prefs)

			if (!compound_data) {
				return
			}
			else if (compound_data.items_compound && compound_data.items_compound.length > 0) {
				socket.emit('compound_data', compound_data)
			}
		} catch (err) {
			_error('io_compound_data', err)
		}
	})()
}



// UNIVERSAL DATA
async function get_all_simple_data (prefs) {

	try {

		// Gather Dat
		let _q = utils._query_match_all()

		let _url = utils._es_url(_index, _q)

		let scanner = await axios.post(_url)

		let hits = scanner.data.hits.hits

		let all_hits = _.map(hits, (obj) => {

			return obj._source

		})

		let most_recent = utils._most_recent(all_hits, prefs._interval, false)


		// Data to send
		const items_all = _.sortBy(most_recent, function (obj) {

			return -(obj.timestamp)

		})

		const all_markets = await _all_markets()

		// Result
		return {

			items_all: _.sortBy(items_all, (obj) => {

			    return -(obj.timestamp)

			}),

			all_markets: _.sortBy(all_markets, (obj) => {

				return -(obj.timestamp)

			})

		}

	} catch (err) {
		_error('get_all_simple_data', err)
	}

}

function io_all_simple_data (socket, prefs) {
	(async function () {
		try {
			if (!prefs) {
				prefs = user_prefs_default
			}
			let all_simple_data = await get_all_simple_data(prefs)
			if (!all_simple_data) {
				return
			}
			else if (all_simple_data.all_markets && all_simple_data.all_markets.length > 0) {
				socket.emit('all_simple_data', {
					all_simple_data: all_simple_data,
					prefs: prefs,
				})
			}
		} catch (err) {
			_error('io_all_simple_data', err)
		}
	})()
}



let _count = 0

let cache_id

if (_count === 0) {
	cache_id = _.now()
}

// MODULE EXPORTS
exports = module.exports = function (io) {

	io.on('connection', (socket) => {

		
		log.lightYellow('connection.....', socket.id)

		socket.emit('cache_id', cache_id)

		// Compound & Simple & Universal Data Init on Authentication
		socket.on('authenticated_user', (data) => {
			(async function () {

				socket.emit('auth_user', data.auth_user)

				let get_prefs = await utils._get_user_prefs(data.auth_user, user_prefs_default, null)

				let prefs = get_prefs.data

				if (data.auth_user.path_name === '/simple_list') {

					io_all_simple_data(socket, prefs)

					let _q = utils._q(prefs)

					io_simple_data(_q, socket, prefs)

				}
				else if (data.auth_user.path_name === '/compound_list') {

					io_all_simple_data(socket, prefs)

					io_compound_data(socket, prefs)

				}

			})()
		})

		// Universal Data (all_markets, etc...)
		socket.on('get_all_simple_data', (data) => {
			(async function () {

				let get_prefs = await utils._get_user_prefs(data.auth_user, user_prefs_default, null)

				let prefs = get_prefs.data

				if (data.auth_user.path_name === '/simple_list') {

					io_all_simple_data(socket, prefs)

				}
				else if (data.auth_user.path_name === '/compound_list') {

					io_all_simple_data(socket, prefs)

				}

			})()
		})


		// Compound List Data & Filters
		socket.on('get_compound_data', (data) => {
			(async function () {

				let get_prefs = await utils._get_user_prefs(data.auth_user, user_prefs_default, null)

				let prefs = get_prefs.data

				if (data.auth_user.path_name === '/compound_list') {

					io_compound_data(socket, prefs)

				}
			})()
		})

		socket.on('vol_multiplier', (data) => {
			(async function () {
				let get_prefs = await utils._get_user_prefs(data.auth_user, user_prefs_default, null)

				let prefs = get_prefs.data

				prefs._is_2x = +data.item.key

				if (data.auth_user.path_name === '/compound_list') {

					io_compound_data(socket, prefs)

					await utils._set_user_prefs(data.auth_user, prefs)

				}
			})()
		})

		socket.on('vol_recent_hrs', (data) => {
			(async function () {
				let get_prefs = await utils._get_user_prefs(data.auth_user, user_prefs_default, null)

				let prefs = get_prefs.data

				prefs._vol_last_to = data.item.to

				prefs._vol_last_from = data.item.from

				prefs._vol_past_to = data.item.from

				if (data.auth_user.path_name === '/compound_list') {

					io_compound_data(socket, prefs)

					await utils._set_user_prefs(data.auth_user, prefs)

				}
			})()
		})

		socket.on('vol_past_hrs', (data) => {
			(async function () {
				let get_prefs = await utils._get_user_prefs(data.auth_user, user_prefs_default, null)

				let prefs = get_prefs.data

				prefs._vol_past_from = data.item.from

				if (data.auth_user.path_name === '/compound_list') {

					io_compound_data(socket, prefs)

					await utils._set_user_prefs(data.auth_user, prefs)

				}
			})()
		})

		socket.on('obo_recent_hrs', (data) => {
			(async function () {
				let get_prefs = await utils._get_user_prefs(data.auth_user, user_prefs_default, null)

				let prefs = get_prefs.data

				prefs._obo_last_to = data.item.to

				prefs._obo_last_from = data.item.from

				prefs._obo_past_to = data.item.from

				if (data.auth_user.path_name === '/compound_list') {

					io_compound_data(socket, prefs)

					await utils._set_user_prefs(data.auth_user, prefs)

				}
			})()
		})

		socket.on('obo_past_hrs', (data) => {
			(async function () {
				let get_prefs = await utils._get_user_prefs(data.auth_user, user_prefs_default, null)

				let prefs = get_prefs.data

				prefs._obo_past_from = data.item.from

				if (data.auth_user.path_name === '/compound_list') {

					io_compound_data(socket, prefs)

					await utils._set_user_prefs(data.auth_user, prefs)

				}
			})()
		})

		socket.on('obo_multiplier', (data) => {
			(async function () {

				_log.cyan('obo_multiplier')
				log.bright.cyan(data)

				let get_prefs = await utils._get_user_prefs(data.auth_user, user_prefs_default, null)

				let prefs = get_prefs.data

				prefs._is_2x_obo = +data.item.key

				if (data.auth_user.path_name === '/compound_list') {

					io_compound_data(socket, prefs)

					await utils._set_user_prefs(data.auth_user, prefs)

				}
			})()
		})


		// Simple List Data & Filters
		socket.on('get_simple_data', (data) => {
			(async function () {

				let get_prefs = await utils._get_user_prefs(data.auth_user, user_prefs_default, null)

				let prefs = get_prefs.data

				let _q = utils._q(prefs)

				io_simple_data(_q, socket, prefs)

			})()
		})

		socket.on('interval', (data) => {
			(async function () {

				let update = await utils._update_user_pref(data)

				io_simple_data(update._q, socket, update.prefs)

				await utils._set_user_prefs(data.auth_user, update.prefs)

			})()
		})

		socket.on('set_percent_up', (data) => {
			(async function () {

				let update = await utils._update_user_pref_percent_props(data)

				io_simple_data(update._q, socket, update.prefs)

				await utils._set_user_prefs(data.auth_user, update.prefs)

			})()
		})

		socket.on('set_percent_down', (data) => {
			(async function () {

				let update = await utils._update_user_pref_percent_props(data)

				io_simple_data(update._q, socket, update.prefs)

				await utils._set_user_prefs(data.auth_user, update.prefs)

			})()
		})

		socket.on('show_percent_props', (data) => {
			(async function () {

				data.side = 'show'

				let update = await utils._update_user_pref_percent_props_show(data)

				io_simple_data(update._q, socket, update.prefs)

				await utils._set_user_prefs(data.auth_user, update.prefs)

				socket.emit('enable_ctrl')

			})()
		})

		socket.on('hide_percent_props', (data) => {
			(async function () {

				data.side = 'hide'

				let update = await utils._update_user_pref_percent_props_show(data)

				io_simple_data(update._q, socket, update.prefs)

				await utils._set_user_prefs(data.auth_user, update.prefs)

				socket.emit('enable_ctrl')

			})()
		})

		socket.on('lower_bound', (data) => {
			(async function () {

				let update = await utils._update_user_pref(data)

				io_simple_data(update._q, socket, update.prefs)

				await utils._set_user_prefs(data.auth_user, update.prefs)

			})()
		})

		socket.on('upper_bound', (data) => {
			(async function () {

				let update = await utils._update_user_pref(data)

				io_simple_data(update._q, socket, update.prefs)

				await utils._set_user_prefs(data.auth_user, update.prefs)

			})()
		})

		socket.on('filter_by_quote', (data) => {
			(async function () {

				let update = await utils._update_user_pref_quote(data)

				io_simple_data(update._q, socket, update.prefs)

				await utils._set_user_prefs(data.auth_user, update.prefs)

			})()
		})


		// Watchlist & Ignore List
		socket.on('set_watchlist_symbols', (data) => {
			(async function () {

				let update = await utils._update_user_pref_watchlist_symbols(data)

				await utils._set_user_prefs(data.auth_user, update.prefs)

			})()
		})

		socket.on('set_ignore_list_symbols', (data) => {
			(async function () {

				log.lightMagenta(data.auth_user.path_name)

				if (data.auth_user.path_name === '/simple_list') {

					let update = await utils._update_user_pref_ignore_list_symbols(data)

					io_simple_data(update._q, socket, update.prefs)

					await utils._set_user_prefs(data.auth_user, update.prefs)

				}
				else if (data.auth_user.path_name === '/compound_list') {

					let update = await utils._update_user_pref_ignore_list_symbols(data)

					io_compound_data(socket, update.prefs)

					await utils._set_user_prefs(data.auth_user, update.prefs)

				}

			})()
		})

		socket.on('get_market_details', (data) => {
			(async function () {

				let candle_data = await api_market_info(data)

				socket.emit('market_details', {
					market_details: data,
					candle_data: candle_data
				})

			})()
		})


		// Disconnect
		socket.on('disconnect', () => {
			// io.removeAllListeners()
		})


	})

}