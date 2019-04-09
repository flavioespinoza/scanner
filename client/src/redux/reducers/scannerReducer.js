const log = require('ololog').configure({
	locate: false
})
const utils = require('../../util/utils')
const _log = utils._log

export default function reducer (state = {

	market_details: {},
	candle_data: [],


	data: [],

	market_details_candle_data: [],
	market_details_symbol: null,

	all_watchlist_markets: [],
	show_watchlist: false,
	watchlist_symbols: [],
	watchlist: [],

	interval: 5,
	init_props: {},
	percent_props: {

		open_close: {
			prop_name: 'open_close',
			percent_up: 1,
			percent_down: -1 ,
			show: true
		},
		open_high: {
			prop_name: 'open_high',
			percent_up: 0.001,
			percent_down: -0.001 ,
			show: false
		},
		open_low: {
			prop_name: 'open_low',
			percent_up: 0.001,
			percent_down: -0.001 ,
			show: false
		},

		close_open: {
			prop_name: 'close_open',
			percent_up: 0.001,
			percent_down: -0.001 ,
			show: false
		},
		close_high: {
			prop_name: 'close_high',
			percent_up: 0.001,
			percent_down: -0.001 ,
			show: false
		},
		close_low: {
			prop_name: 'close_low',
			percent_up: 0.001,
			percent_down: -0.001 ,
			show: false
		},

		high_open: {
			prop_name: 'high_open',
			percent_up: 0.001,
			percent_down: -0.001 ,
			show: false
		},
		high_close: {
			prop_name: 'high_close',
			percent_up: 0.001,
			percent_down: -0.001 ,
			show: false
		},
		high_low: {
			prop_name: 'high_low',
			percent_up: 0.001,
			percent_down: -0.001 ,
			show: false
		},

		low_open: {
			prop_name: 'low_open',
			percent_up: 0.001,
			percent_down: -0.001 ,
			show: false
		},
		low_close: {
			prop_name: 'low_close',
			percent_up: 0.001,
			percent_down: -0.001 ,
			show: false
		},
		low_high: {
			prop_name: 'low_high',
			percent_up: 0.001,
			percent_down: -0.001 ,
			show: false
		}

	},
	all_compare: [],
	compare: [],
	percent_up: null,
	percent_down: null,
	sort_by: 'timestamp',
	sort_desc: true,
	query: {},
	quote_state: {},
	quote_search: [],
	lower_bound: null,
	upper_bound: null,
	from: null,
	to: null,
	update_data: true,
	disable_ctrl: false,
	min: null,
	max: null,
	show_ignore_list: false,
	ignore_list: [],
	ignore_list_symbols: [],
	all_watchlist_markets_ignore_list: [],
	items: [],
	all_items: [],
	update: true,
	items_qfl: [],
	route: null,

	authenticated: true,

	all_simple_data: {},
	simple_data: {},
	compound_data: {},


}, action) {

	switch (action.type) {
		case 'SET_ALL_SIMPLE_DATA': {
			// log.yellow('reducer --> SET_ALL_SIMPLE_DATA', action.payload)
			return {
				...state,
				all_simple_data: action.payload
			}

		}
		case 'SET_SIMPLE_DATA': {
			// log.yellow('reducer --> SET_SIMPLE_DATA', action.payload)
			return {
				...state,
				simple_data: action.payload
			}

		}
		case 'SET_COMPOUND_DATA': {
			// log.yellow('reducer --> SET_COMPOUND_DATA', action.payload)
			return {
				...state,
				compound_data: action.payload
			}

		}
		case 'SET_AUTHENTICATED': {
			// if (action.payload) {
			// 	log.blue('reducer --> SET_AUTHENTICATED', action.payload)
			// }
			// else {
			// 	log.red('reducer --> SET_AUTHENTICATED', action.payload)
			// }

			return {
				...state,
				authenticated: action.payload
			}

		}
		case 'SET_ROUTE': {
			// log.yellow('reducer --> SET_ROUTE', action.payload)
			return {
				...state,
				route: action.payload
			}

		}
		case 'SET_ITEMS_QFL': {
			// log.yellow('reducer --> SET_ITEMS_QFL')
			// console.log(JSON.stringify(action.payload[0], null, 2))
			return {
				...state,
				items_qfl: action.payload
			}

		}
		case 'SET_ALL_MARKETS_IGNORE_LIST': {
			// log.red('reducer --> SET_ALL_MARKETS_IGNORE_LIST')
			// console.log(action.payload)
			return {
				...state,
				all_watchlist_markets_ignore_list: action.payload
			}

		}
		case 'SET_UPDATE': {
			// log.red('reducer --> SET_UPDATE', action.payload)
			return {
				...state,
				update: action.payload
			}

		}
		case 'ACTION_SET_ITEMS': {
			// log.cyan('ACTION_SET_ITEMS --> SET_ITEMS')
			// console.log(action.payload)
			return {
				...state,
				items: action.payload
			}

		}
		case 'SET_ITEMS': {
			 // log.cyan('REDUCER --> SET_ITEMS')
			// console.log(action.payload)
			return {
				...state,
				items: action.payload
			}

		}
		case 'SET_ALL_ITEMS': {
			// log.yellow('REDUCER --> SET_ALL_ITEMS')
			// console.log(action.payload)

			return {
				...state,
				all_items: action.payload
			}

		}
		case 'SHOW_IGNORE_LIST': {
			// log.cyan('REDUCER --> SHOW_IGNORE_LIST', action.payload)

			return {
				...state,
				show_ignore_list: action.payload
			}

		}
		case 'SET_IGNORE_LIST': {
			// log.cyan('REDUCER --> SET_IGNORE_LIST')
			// console.log(action.payload)

			return {
				...state,
				ignore_list: action.payload
			}

		}
		case 'SET_IGNORE_LIST_SYMBOLS': {
			// log.cyan('REDUCER --> SET_IGNORE_LIST_SYMBOLS')
			// console.log(action.payload)

			return {
				...state,
				ignore_list_symbols: action.payload
			}

		}
		case 'CLEAR_MARKET_DETAILS': {
			//log.red('REDUCER --> CLEAR_MARKET_DETAILS', action.payload)
			return {
				...state,
				data: [],
				market_details_candle_data: [],
				market_details_symbol: null,
				market_details: {},
			}

		}
		case 'MARKET_DETAILS_CANDLE_DATA': {
			// log.red('REDUCER --> MARKET_DETAILS_CANDLE_DATA', action.payload)
			//console.log('REDUCER --> MARKET_DETAILS_CANDLE_DATA', action.payload)
			return {
				...state,
				data: action.payload,
				market_details_candle_data: action.payload,
				market_details_symbol: action.payload[0].symbol
			}

		}
		case 'SET_MARKET_DETAILS': {
			log.cyan('REDUCER --> SET_MARKET_DETAILS')
			console.log(action.payload)
			return {
				...state,
				market_details: action.payload.market_details,
				candle_data: action.payload.candle_data,
			}

		}
		case 'SET_ALL_MARKETS': {
			// log.cyan('REDUCER --> SET_ALL_MARKETS')
			// console.log(action.payload)

			return {
				...state,
				all_watchlist_markets: action.payload
			}

		}
		case 'SHOW_WATCHLIST': {
			// log.cyan('REDUCER --> SHOW_WATCHLIST', action.payload)

			return {
				...state,
				show_watchlist: action.payload
			}

		}
		case 'SET_WATCHLIST': {
			// log.yellow('REDUCER --> SET_WATCHLIST')
			// console.log(action.payload)

			return {
				...state,
				watchlist: action.payload
			}

		}
		case 'SET_WATCHLIST_SYMBOLS': {
			// log.cyan('REDUCER --> SET_WATCHLIST_SYMBOLS')
			// console.log(action.payload)

			return {
				...state,
				watchlist_symbols: action.payload
			}

		}
		case 'SET_INTERVAL': {
			// log.cyan('REDUCER --> SET_INTERVAL')
			// console.log(action.payload)

			return {
				...state,
				interval: action.payload
			}
		}
		case 'SET_INIT_PROPS': {
			// log.cyan('REDUCER --> SET_INIT_PROPS')
			// console.log(action.payload)

			return {
				...state,
				init_props: action.payload
			}
		}
		case 'SET_PERCENT_PROPS': {
			// log.cyan('REDUCER --> SET_PERCENT_PROPS')
			// console.log(action.payload)

			return {
				...state,
				percent_props: action.payload
			}
		}
		case 'MIN': {
			// log.red('MIN', action.payload)
			return {
				...state,
				min: action.payload
			}
		}
		case 'MAX': {
			// log.blue('MAX', action.payload)
			return {
				...state,
				max: action.payload
			}
		}
		case 'UPDATE_DATA': {
			// log.blue('UPDATE_DATA', action.payload)
			// log.red('DISABLE_CTRL', !action.payload)
			return {
				...state,
				update_data: action.payload,
				disable_ctrl: !action.payload
			}
		}
		case 'TO': {
			// log.blue('TO', action.payload)
			return {
				...state,
				to: action.payload
			}
		}
		case 'FROM': {
			// log.red('FROM', action.payload)
			return {
				...state,
				from: action.payload
			}
		}
		case 'LOWER_BOUND': {
			// log.blue('LOWER_BOUND', action.payload)
			return {
				...state,
				lower_bound: action.payload
			}
		}
		case 'UPPER_BOUND': {
			// log.red('UPPER_BOUND', action.payload)
			return {
				...state,
				upper_bound: action.payload
			}
		}
		case 'QUOTE_SEARCH': {
			// console.log('QUOTE_SEARCH', action.payload)
			return {
				...state,
				quote_search: action.payload
			}
		}
		case 'QUOTE_STATE': {
			// log.red('QUOTE_STATE', action.payload)
			return {
				...state,
				quote_state: action.payload
			}
		}
		case 'QUERY': {
			// log.red('QUERY', action.payload)
			return {
				...state,
				query: action.payload
			}
		}
		case 'ALL_COMPARE': {
			// log.red('ALL_COMPARE', action.payload.length)
			return {
				...state,
				all_compare: action.payload
			}
		}
		case 'COMPARE': {
			// log.blue('COMPARE', action.payload.length)
			return {
				...state,
				compare: action.payload
			}
		}
		case 'PERCENT_UP': {
			// log.lightBlue('PERCENT_UP', action.payload)
			return {
				...state,
				percent_up: action.payload
			}
		}
		case 'PERCENT_DOWN': {
			// log.lightRed('PERCENT_DOWN', action.payload)
			return {
				...state,
				percent_down: action.payload
			}
		}

	}

	return state

}