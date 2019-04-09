const _log = require('./utils')._log
const log = require('ololog').configure({locate: false})
const _ = require('lodash')

const watchlist = {

	symbol: 'BTC/USDT',
	market_name: 'btc_usdt',
	timestamp: 1545786720000,
	date_iso: '2018-12-26T01:12:00.000Z',
	date: '2018-12-26T01:12:00.000Z',
	date_string: 'Dec 26, 1:12:00:000 AM',
	open: 3848.86,
	close: 3840.43,
	high: 3848.86,
	low: 3840.43,
	volume: 4.28,
	volumeQuote: 16452.539,
	pairing: 'BTCUSD',
	pairing_raw: 'BTCUSD',
	base: 'BTC',
	quote: 'USDT',
	date_last: '2018-12-26T01:12:00.000Z',
	date_prev: '2018-12-26T01:12:00.000Z',
	decimal: -0.0003019583037232784,
	num: -0.030195830372327842,
	percent_change: -0.030195830372327842,
	percent_drop: 0.030195830372327842,
	percent_rise: 0,
	time_gap_ms: 0,
	time_gap_sec: 0,
	time_gap_min: 0,
	volume_base_5m: 222.41,
	volume_base_15m: 361.33,
	volume_base_24h: 26708.72,
	volume_quote_5m: 852180.77,
	volume_quote_15m: 1383355.1577999997,
	volume_quote_24h: 101697358.9171,
	volume_quote_btc_5m: 221.89722765419498,
	volume_quote_btc_15m: 360.20840317360285,
	volume_quote_btc_24h: 26480.72192882047,
	wins_2: 327,
	losses_2: 323,
	wins_3: 143,
	losses_3: 131,
	wins_4: 66,
	losses_4: 52,
	candle_count: 1437

}

const watchlist_view = {
	symbol: false,
	market_name: false,
	timestamp: false,
	date_iso: false,
	date: false,
	date_string: false,
	open: false,
	close: false,
	high: false,
	low: false,
	volume: false,
	volumeQuote: false,
	pairing: false,
	pairing_raw: false,
	base: false,
	quote: false,
	date_last: false,
	date_prev: false,
	decimal: false,
	num: false,
	percent_change: false,
	percent_drop: false,
	percent_rise: false,
	time_gap_ms: false,
	time_gap_sec: false,
	time_gap_min: false,
	volume_base_5m: false,
	volume_base_15m: false,
	volume_base_24h: false,
	volume_quote_5m: false,
	volume_quote_15m: false,
	volume_quote_24h: false,
	volume_quote_btc_5m: false,
	volume_quote_btc_15m: false,
	volume_quote_btc_24h: false,
	wins_2: false,
	losses_2: false,
	wins_3: false,
	losses_3: false,
	wins_4: false,
	losses_4: false,
	candle_count: false
}

const WatchListCols = {

	symbol: true,
	timestamp: true,
	open: true,
	close: true,
	high: true,
	low: true,
	volume: true,
	volumeQuote: true

}


const user_obj = {
	'_id': {
		'$oid': '5c354e4696cdf457a234c43a'
	},
	'updatedAt': {
		'$date': '2019-01-09T01:28:38.905Z'
	},
	'createdAt': {
		'$date': '2019-01-09T01:28:38.905Z'
	},
	'password': '$2a$05$PSdZnx0JJAWa2oPqr5Eq1uBw5bowB7VuNzhJbE6lIJcoM/8h53X6C',
	'email': 'flavio.espinoza@gmail.com',
	'deactivated': false,
	'role': 'user',
	'name': {
		'first': 'Flavio',
		'last': 'Espinoza'
	},
	'__v': 0
}

const table_view = {
	_id: '_id.$oid',
	created_at: 'createdAt',
	updated_at: 'updatedAt',
	role: 'role',
	first_name: 'name.first',
	last_name: 'name.last',
	email: 'email'
}

console.log(JSON.stringify(table_view, null, 2))

const temp = {

	'firstName': 'Bob',
	'lastName': 'Smith',
	'address': {
		'street': '2447 Mt Royal Rd',
		'city': 'Pittsburgh',
		'state': 'PA',
		'zip': '15217'
	}
}

const view = {
	'Last Name': 'lastName',
	'City': 'address.city',
	'State': 'address.state'
}

const user = {
	user: {
		id: '5c35549d58196e588bcc6c57',
		firstName: 'Flavio',
		lastName: 'Espinoza',
		email: 'flavio.espinoza@gmail.com',
		role: 'user'
	}
}

const user_prefs = {
	'_id': '5c35549d58196e588bcc6c57',
	'_ignore_list_symbols': [
		'LTC/USDT',
		'BMC/USDT'
	],
	'_interval': 5,
	'_lower_bound': 1,
	'_percent_props': {
		'open_close': {
			'prop_name': 'open_close',
			'percent_up': 1,
			'percent_down': -1,
			'show': true
		},
		'open_high': {
			'prop_name': 'open_high',
			'percent_up': 0.001,
			'percent_down': -0.001,
			'show': false
		},
		'open_low': {
			'prop_name': 'open_low',
			'percent_up': 0.001,
			'percent_down': -0.001,
			'show': false
		},
		'close_open': {
			'prop_name': 'close_open',
			'percent_up': 0.001,
			'percent_down': -0.001,
			'show': false
		},
		'close_high': {
			'prop_name': 'close_high',
			'percent_up': 0.001,
			'percent_down': -0.001,
			'show': false
		},
		'close_low': {
			'prop_name': 'close_low',
			'percent_up': 0.001,
			'percent_down': -0.001,
			'show': false
		},
		'high_open': {
			'prop_name': 'high_open',
			'percent_up': 0.001,
			'percent_down': -0.001,
			'show': false
		},
		'high_close': {
			'prop_name': 'high_close',
			'percent_up': 0.001,
			'percent_down': -0.001,
			'show': false
		},
		'high_low': {
			'prop_name': 'high_low',
			'percent_up': 0.001,
			'percent_down': -0.001,
			'show': false
		},
		'low_open': {
			'prop_name': 'low_open',
			'percent_up': 0.001,
			'percent_down': -0.001,
			'show': false
		},
		'low_close': {
			'prop_name': 'low_close',
			'percent_up': 0.001,
			'percent_down': -0.001,
			'show': false
		},
		'low_high': {
			'prop_name': 'low_high',
			'percent_up': 0.001,
			'percent_down': -0.001,
			'show': false
		}
	},
	'_quote': [],
	'_quote_exclude_arr': [
		'DAI',
		'TUSD',
		'EURS',
		'EOS'
	],
	'_quote_state': {
		'btc': true,
		'usdt': true,
		'eth': true
	},
	'_show_ignore_list': false,
	'_show_watchlist': false,
	'_upper_bound': 60001,
	'_watchlist_symbols': [
		'BTC/USDT',
		'ETH/USDT'
	],
	'email': 'flavio.espinoza@gmail.com',
	'firstName': 'Flavio',
	'id': '5c35549d58196e588bcc6c57',
	'lastName': 'Espinoza',
	'role': 'user'
}

const interval = {
	name: "interval",
	prop: "_interval",
	auth_user: {
		id: "5c35549d58196e588bcc6c57",
		firstName: "Flavio",
		lastName: "Espinoza",
		email: "flavio.espinoza@gmail.com",
		role: "user"
	},
	value: 30
}

const compound_data_example = {
	"key": "adh_btc",
	"is_watchlist": false,
	"is_ignore_list": false,


	"vol_avg_60hr": 2765.232815964523,
	"vol_avg_1hr": 4141.666666666667,
	"vol_percent_diff": 149.78,
	"vol_is_2x": false,
	"vol_is_3x": false,
	"vol_is_4x": false,
	"vol_is_5x": false,



	"vol_quote_avg_60hr": 0.0020958274962622394,
	"vol_quote_avg_1hr": 0.0037703833858055685,
	"vol_quote_percent_diff": 179.9,
	"vol_quote_is_2x": false,
	"vol_quote_is_3x": false,
	"vol_quote_is_4x": false,
	"vol_quote_is_5x": false,



	"candle_vacancy_percent": null,
	"symbol": "ADH/BTC",
	"quote": "BTC",
	"pairing": "ADHBTC",
	"market_name": "adh_btc",
	"timestamp": 1547901000000,
	"base": "ADH",
	"bids_past_4hr": 7985,
	"bids_qty_past_4hr": 272680700,
	"asks_past_4hr": 5176,
	"asks_qty_past_4hr": 6657000,
	"bids_past_1hr": 1619,
	"bids_qty_past_1hr": 3556300,
	"asks_past_1hr": 1634,
	"asks_qty_past_1hr": 1634,
	"bids_percent_diff": 20.28,
	"asks_percent_diff": 31.57,
	"bids_qty_percent_diff": 1.3,
	"asks_qty_percent_diff": 0.02,
	"bids_is_50": false,
	"bids_is_1x": false,
	"bids_is_2x": false,
	"bids_is_3x": false,
	"bids_is_4x": false,
	"bids_is_5x": false,
	"asks_is_50": false,
	"asks_is_1x": false,
	"asks_is_2x": false,
	"asks_is_3x": false,
	"asks_is_4x": false,
	"asks_is_5x": false,
	"bids_qty_is_50": false,
	"bids_qty_is_1x": false,
	"bids_qty_is_2x": false,
	"bids_qty_is_3x": false,
	"bids_qty_is_4x": false,
	"bids_qty_is_5x": false,
	"asks_qty_is_50": false,
	"asks_qty_is_1x": false,
	"asks_qty_is_2x": false,
	"asks_qty_is_3x": false,
	"asks_qty_is_4x": false,
	"asks_qty_is_5x": false,
	"doc_count": 755,
	"buys_past_30hr": 4116,
	"sells_past_30hr": 5315,
	"buys_past_1hr": 320,
	"sells_past_1hr": 297,
	"buys_qty_30hr": 2117300,
	"sells_qty_30hr": 2024400,
	"buys_qty_1hr": 143900,
	"sells_qty_1hr": 108100,
	"buys_percent_diff": 7.77,
	"sells_percent_diff": 5.59,
	"buys_qty_percent_diff": 6.8,
	"sells_qty_percent_diff": 5.34,
	"buys_is_50": false,
	"buys_is_1x": false,
	"buys_is_2x": false,
	"sells_is_50": false,
	"sells_is_1x": false,
	"sells_is_2x": false,
	"buys_qty_is_50": false,
	"buys_qty_is_1x": false,
	"buys_qty_is_2x": false,
	"sells_qty_is_50": false,
	"sells_qty_is_1x": false,
	"sells_qty_is_2x": false
}

const compound_data = {

	key: false,
	is_watchlist: false,
	is_ignore_list: false,


	// Vol - BASE Coin
	vol_avg_60hr: false,
	vol_avg_1hr: false,
	vol_percent_diff: false,

	vol_is_2x: false,
	vol_is_3x: false,
	vol_is_4x: false,
	vol_is_5x: false,


	// Vol - Quote Coin
	vol_quote_avg_60hr: false,
	vol_quote_avg_1hr: false,
	vol_quote_percent_diff: false,

	vol_quote_is_2x: false,
	vol_quote_is_3x: false,
	vol_quote_is_4x: false,
	vol_quote_is_5x: false,

	candle_vacancy_percent: false,

	symbol: false,
	quote: false,
	pairing: false,
	market_name: false,
	timestamp: false,
	base: false,
	bids_past_4hr: false,
	bids_qty_past_4hr: false,
	asks_past_4hr: false,
	asks_qty_past_4hr: false,
	bids_past_1hr: false,
	bids_qty_past_1hr: false,
	asks_past_1hr: false,
	asks_qty_past_1hr: false,
	bids_percent_diff: false,
	asks_percent_diff: false,
	bids_qty_percent_diff: false,
	asks_qty_percent_diff: false,

	bids_is_50: false,
	bids_is_1x: false,
	bids_is_2x: false,
	bids_is_3x: false,
	bids_is_4x: false,
	bids_is_5x: false,
	asks_is_50: false,
	asks_is_1x: false,
	asks_is_2x: false,
	asks_is_3x: false,
	asks_is_4x: false,
	asks_is_5x: false,

	bids_qty_is_50: false,
	bids_qty_is_1x: false,
	bids_qty_is_2x: false,
	bids_qty_is_3x: false,
	bids_qty_is_4x: false,
	bids_qty_is_5x: false,

	asks_qty_is_50: false,
	asks_qty_is_1x: false,
	asks_qty_is_2x: false,
	asks_qty_is_3x: false,
	asks_qty_is_4x: false,
	asks_qty_is_5x: false,

	doc_count: false,
	buys_past_30hr: false,
	sells_past_30hr: false,
	buys_past_1hr: false,
	sells_past_1hr: false,
	buys_qty_30hr: false,
	sells_qty_30hr: false,
	buys_qty_1hr: false,
	sells_qty_1hr: false,
	buys_percent_diff: false,
	sells_percent_diff: false,
	buys_qty_percent_diff: false,
	sells_qty_percent_diff: false,
	buys_is_50: false,
	buys_is_1x: false,
	buys_is_2x: false,
	sells_is_50: false,
	sells_is_1x: false,
	sells_is_2x: false,
	buys_qty_is_50: false,
	buys_qty_is_1x: false,
	buys_qty_is_2x: false,
	sells_qty_is_50: false,
	sells_qty_is_1x: false,
	sells_qty_is_2x: false,

}

let _keys = _.keys(compound_data)

let _view = {}

_.map(_keys, (key) => {
	_view[key] = false
})

_log.deep(_view)