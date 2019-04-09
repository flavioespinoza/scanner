import { tsvParse, csvParse } from 'd3-dsv'
import { timeParse } from 'd3-time-format'
import copyToClipboard from 'copy-to-clipboard'
import _ from 'lodash'
import { format } from 'd3-format'
const __log__ = require('ololog').configure({locate: false})

const axios = require('axios')

const alien_symbols = ['≢', '⸎', '≣']

export const _log = {
	error: (msg) => {
		console.log(`%c ${msg} `, `color:white; background-color:Brown`)
	},
	alert: (msg) => {
		console.log(`%c ${msg} `, `color:white; background-color:Orange`)
	},
	warn: (msg) => {
		console.log(`%c ${msg} `, `color:white; background-color:MediumPurple`)
	},
	info: (msg) => {
		console.log(`%c ${msg} `, `color:white; background-color:DodgerBlue`)
	},
	cyan: (msg) => {
		console.log(`%c ${msg} `, `color:white; background-color:DeepSkyBlue`)
	},
	pink: (msg) => {
		console.log(`%c ${msg} `, `color:white; background-color:HotPink`)
	},
	green: (msg) => {
		console.log(`%c ${msg} `, `color:white; background-color:LimeGreen`)
	},
	red: (msg) => {
		console.log(`%c ${msg} `, `color:white; background-color:Red`)
	},
	blood: (msg) => {
		console.log(`%c ${msg} `, `color:white; background-color:Crimson`)
	},

	assert: (item, item_name) => {
		if (item) {
			console.log(`%c ASSERT SUCCESS: ${item_name} = ${item} `, `color:black; background-color:cyan`)
		}
		else {
			console.log(`%c ASSERT FAIL: ${item_name} = ${item} `, `color:white; background-color:red`)
		}
	},
	timer: (method, method_name) => {
		log.lightYellow('--------- timer -----------')
		console.time(`${method_name}()`)
		method()
		console.timeEnd(`${method_name}()`)
		log.lightYellow('--------- timer -----------')
	}

}

export const log = __log__

export const _time_frames = {
	'1': 'M1',
	'3': 'M3',
	'5': 'M5',
	'15': 'M15',
	'30': 'M30', // default
	'60': 'H1',
	'240': 'H4',
	'1440': 'D1',

	'1m': 'M1',
	'3m': 'M3',
	'5m': 'M5',
	'15m': 'M15',
	'30m': 'M30', // default
	'1h': 'H1',
	'4h': 'H4',
	'1d': 'D1'
}

export function _alpha_numeric_filter (string) {

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

export function _cols (_state_cols, _columns_qfl) {

	const up_arrow = '↑'
	const down_arrow = '↓'

	// QFL COLUMNS
	for (let i = 0; i < _columns_qfl.length; i++) {
		_columns_qfl[i].name = _columns_qfl[i].name_bak
	}

	let _idx = _.findIndex(_state_cols, (obj) => {
		return obj.isSorted
	})
	let _qfl_obj = _state_cols[_idx]

	_columns_qfl[_idx].isSorted = true
	_columns_qfl[_idx].isSortedDescending = _qfl_obj.isSortedDescending

	if (_columns_qfl[_idx].isSortedDescending) {
		if (_columns_qfl[_idx].fieldName === 'is_ignore_list' || _columns_qfl[_idx].fieldName === 'is_watchlist') {
			_columns_qfl[_idx].name = _columns_qfl[_idx].name_bak
		} else {
			_columns_qfl[_idx].name = _columns_qfl[_idx].name_bak + '_' + down_arrow
		}
	} else {
		if (_columns_qfl[_idx].fieldName === 'is_ignore_list' || _columns_qfl[_idx].fieldName === 'is_watchlist') {
			_columns_qfl[_idx].name = _columns_qfl[_idx].name_bak
		} else {
			_columns_qfl[_idx].name = _columns_qfl[_idx].name_bak + '_' + up_arrow
		}
	}

	return _columns_qfl
}

export function _time_from_now (timestamp) {

	let date_now = new Date().getTime()

	let d = Math.abs(date_now - timestamp) / 1000
	let r = {}
	let s = {                                                                  // structure
		yr: 31536000,
		mo: 2592000,
		w: 604800, // uncomment row to ignore
		d: 86400,   // feel free to add your own row
		h: 3600,
		m: 60,
		s: 1
	}

	Object.keys(s).forEach(function (key) {
		r[key] = Math.floor(d / s[key])
		d -= r[key] * s[key]
	})

	// for example: {yr:0,mo:0,w:1,d:2,h:34,m:56,s:7}
	// console.log(r)

	let time = ''

	let keys = [
		'yr',
		'mo',
		'w',
		'd',
		'h',
		'm',
		's'
	]

	_.each(keys, function (key) {
		if (r[key] > 0) {
			let string = ` ${r[key]}${key}`
			time = time + string
		}
	})

	return time
}

export function _set (arr, string) {

	arr.push(string)

	return [...new Set(arr)]
}

export function _ts (string_literal) {
	return _.toString(string_literal)
}

export function _interval_integer (interval) {

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

export async function _candle_count_quote_vol (symbol) {

	const _pairing = symbol.replace('/', '')

	const _ms_day = 8.64e+7

	const _to = new Date().getTime()
	const _from = _to - _ms_day

	const _url = function (pairing, from, to) {
		return `https://api.hitbtc.com/api/2/public/candles/${pairing}?period=M1&sort=ASC&from=${from}&till=${to}&limit=1000`
	}

	const get_candles = await axios.get(_url(_pairing, _from, _to))

	const data = get_candles.data

	const length = data.length

	log.cyan('_candle_count_quote_vol: ', length)

}

export function _map_key_val (obj) {
	return Object.entries(obj).map(([key, value]) => ({key, value}))
}

export function _now (arr) {
	return _.last(arr)
}

export function _past (arr) {
	return _.first(arr)
}

export function now_date_compare (now, candle_data) {

	const day = 8.64e+7
	const hour = 3.6e+6

	let fix = 1541655956342

	let now_fix = _.subtract(now, fix)

	if (Math.sign(now_fix) === -1) {

		// log.red('fix date: ', new Date(fix))
		// log.yellow('now date: ', new Date(now))

		console.log('candle_data:', candle_data)

	} else {
		log.blue(now_fix)
	}

}

export function string_contains (str, contains) {
	return str.includes(contains)
}

export function _uniq_all_props (__arr1, __arr2, __by_prop) {

	let arr
	let set = []
	let result = []

	if (__arr1 && __arr2) {
		arr = __arr1.concat(__arr2)
	} else {
		arr = __arr1
	}

	arr.forEach(function (__obj) {
		/** Set each obj to a string. */
		if (__by_prop) {
			let string = JSON.stringify(__obj[__by_prop])
			set.push(string)
		} else {
			let string = JSON.stringify(__obj)
			set.push(string)
		}
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

export function floor_min_trade (qty, min_trade_size) {

	// return Math.floor(qty / min_trade_size) * min_trade_size

	return __toFixed(qty, null, 2, 6)

}

export function __map_exclude (arr, prop, filter) {
	return _.map(_.filter(arr, function (item) {
		return item[prop] !== filter
	}), function (obj) {
		return obj[prop]
	})
}

export function __map_include (arr, prop, filter) {
	return _.map(_.filter(arr, function (item) {
		return item[prop] === filter
	}), function (obj) {
		return obj[prop]
	})
}

export function shadow () {
	return {
		boxShadow: '1px 2px 2px 1px #b9b9b9'
	}
}

export function innerShadow () {
	return {
		boxShadow: 'inset 0 0 10px #a7a7a7'
	}
}

export function numFormat (n) {
	if (n === 0) {
		return 0
	} else if (n >= 1) {
		return format('.3s')(n)
	} else {
		return format('.5f')(n)
	}
}

export function __toSix (__number, __digits, __min, __max) {

	const sign = Math.sign(__number)
	let digits

	if (!__number) {
		return 0
	} else if (__number < 0.000001) {
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

export function __toFixed (__number, __digits, __min, __max, __is_balance) {

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

export function __error (__err) {

	return JSON.stringify(__err)

}

export function __cumsum (__array) {

	let result = [__array[0]]

	for (let i = 1; i < __array.length; i++) {
		result[i] = result[i - 1] + __array[i]
	}

	return result

}

export function __mean (__numbers) {
	let total = 0, i
	for (i = 0; i < __numbers.length; i += 1) {
		total += __numbers[i]
	}
	return total / __numbers.length
}

export function copy (__val) {
	copyToClipboard(__val)
}

export function currencyFormat (__base) {
	if (__base === 'USDT' || __base === 'USD') {
		return '.2f'
	} else {
		return '.10f'
	}
}

export function mouseCoordinateY__format () {
	return '.8f'
}

export function percentFrom () {
	return '.8f'
}

export function color () {
	return {
		light: '#FFFFFF',
		buy: '#6495ed',
		sell: '#FF69B4',
		mid: '#555555',
		dark: '#444444',
		warning: '#F60300',

		buy_rgb: 'rgba(100, 149, 237, 1)',
		sell_rgb: 'rgba(255, 105, 180, 1)',
		mid_rgb: 'rgba(70, 70, 70, 1)',

		side_rgb: function (__side, __opacity) {
			if (__side === 'buy' || __side === 'LIMIT_BUY') {
				return 'rgba(100, 149, 237, ' + __opacity + ')'
			} else if (__side === 'sell' || __side === 'LIMIT_SELL') {
				let opacity = __opacity * 0.80
				return 'rgba(255, 105, 180, ' + opacity + ')'
			} else if (__side === 'all') {
				return 'rgba(68, 68, 68, ' + __opacity + ')'
			}
		},
		side: function (__side) {
			if (__side === 'neutral') {
				return '#FF8200'
			} else if (__side === 'buy' || __side === 'LIMIT_BUY') {
				return '#6495ED'
			} else if (__side === 'sell' || __side === 'LIMIT_SELL') {
				return '#FF69B4'
			}
		}
	}
}

export function spreadsheet () {

	return [

		{
			'_id': '__p_01_SINGLE',
			'title': '__p_01_SINGLE',
			'worksheet_id': '__p_01_SINGLE',
			'grid_length': 2,
			'type': 'paradigm_dropdown'
		},
		{
			'_id': '__p_5_Curve_QFL',
			'title': '__p_5_Curve_QFL',
			'worksheet_id': '__p_5_Curve_QFL',
			'grid_length': 2,
			'type': 'paradigm_dropdown'
		},
		{
			'_id': '__p_5_Equal_rand',
			'title': '__p_5_Equal_rand',
			'worksheet_id': '__p_5_Equal_rand',
			'grid_length': 2,
			'type': 'paradigm_dropdown'
		},
		{
			'_id': '__p_5_Square_exact',
			'title': '__p_5_Square_exact',
			'worksheet_id': '__p_5_Square_exact',
			'grid_length': 2,
			'type': 'paradigm_dropdown'
		},
		{
			'_id': '__p_11_Curve_smooth',
			'title': '__p_11_Curve_smooth',
			'worksheet_id': '__p_11_Curve_smooth',
			'grid_length': 2,
			'updated': 1535738143660
		},
		{
			'_id': '__p_11_Equal_rand',
			'title': '__p_11_Equal_rand',
			'worksheet_id': '__p_11_Equal_rand',
			'grid_length': 2,
			'updated': 1535738143660
		},
		{
			'_id': '__p_11_Square_rand',
			'title': '__p_11_Square_rand',
			'worksheet_id': '__p_11_Square_rand',
			'grid_length': 2,
			'type': 'paradigm_dropdown'
		},
		{
			'_id': '__p_15_Curve_smooth',
			'title': '__p_15_Curve_smooth',
			'worksheet_id': '__p_15_Curve_smooth',
			'grid_length': 2,
			'updated': 1535738143660
		}

	]

}

export function cancelOrder (__order_id) {

}

export function __uniq (__array_1, __array_2) {
	let array = __array_1.concat(__array_2)
	return array.filter(function (value, index, self) {
		return self.indexOf(value) === index
	})
}

export function __non_Uniq (__array_1, __array_2) {
	let array = __array_1.concat(__array_2)
	return array.filter(function (value, index, self) {
		return self.indexOf(value) !== index
	})
}

const ids_exist = [
	'1111',
	'2222',
	'aaaa'

]

const ids_new = [
	'1111',
	'2222',
	'zzzz',
	'dddd'
]

export function __uniq_Filter (__array_1, __array_2) {
	const a = __array_1.filter(function (obj) {
		return __array_2.indexOf(obj) == -1
	})
	const b = __array_2.filter(function (obj) {
		return __array_1.indexOf(obj) == -1
	})
	return a.concat(b)
}

export function __uniq_Orders (__orders_1, __orders_2) {
	const a = __orders_1.map(function (__order_1) {
		return __orders_1.id
	})
	const b = __orders_2.map(function (__order_2) {
		return __order_2.id
	})
	return __uniq_Filter(a, b)
}

/** Test Candle Data from React Stock Charts */
function parseData (parse) {
	return function (d) {
		d.date = parse(d.date)
		d.open = +d.open
		d.high = +d.high
		d.low = +d.low
		d.close = +d.close
		d.volume = +d.volume

		return d
	}
}

const parseDate = timeParse('%Y-%m-%d')

export function getData (data) {
	data = parseData(parseDate)(data)
	return data
}


