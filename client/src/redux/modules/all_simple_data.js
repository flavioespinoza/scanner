import {

	SET_AUTH_USER,

	SET_ITEMS,

	SET_WATCHLIST_SYMBOLS,
	SET_WATCHLIST,
	SHOW_WATCHLIST,

	SET_ALL_MARKETS,

	SET_IGNORE_LIST_SYMBOLS,
	SET_IGNORE_LIST,
	SHOW_IGNORE_LIST,

	SET_INTERVAL,

	SET_INIT_PROPS,
	SET_PERCENT_PROPS,

	TO,
	FROM,

	LOWER_BOUND,
	UPPER_BOUND,

	QUOTE_STATE,

	MIN,
	MAX,

	SET_ITEMS_ALL,

	SET_MARKET_DETAILS,

	VOL_LAST_TO,
	VOL_LAST_FROM,
	VOL_PAST_TO,
	VOL_PAST_FROM,

	OBO_LAST_TO,
	OBO_LAST_FROM,
	OBO_PAST_TO,
	OBO_PAST_FROM,

	GET_TRADES_LAST_TO,
	GET_TRADES_LAST_FROM,
	GET_TRADES_PAST_TO,
	GET_TRADES_PAST_FROM,

	IS_2X,
	IS_2X_OBO,

	SET_ITEMS_COMPOUND,

} from '../../util/redux-constants'

import { _log, log } from '../../util/utils'

import * as utils from '../../util/utils'

// State
/**
 *	getState -- Assigns data_props to the current State object
 *
 * 	@param {Array} type_names_array -- An array of captialized strings names of action types
 *
 * 		@example [SET_ITEMS_ALL, SET_WATCHLIST_SYMBOLS]
 *
 *	@returns {Object} State object wich houses all Redux Store data.
 *
 *		@example {
 *
 *					interval: '15',
 *
 *					watchlist_symbols: [ 'NOAH/BTC, CCL/ETH', 'BTC/USDT' ],
 *
 *					items_simple_all: [ { prop: 1, val 1 }, { prop: 2, val: 2 }, { prop: 3, val: 3 }, { prop: 4, val: 4 } ]
 *
 *					items_simple: [ { prop: 1, val 1 }, { prop: 4, val: 4 }],
 *
 *					market_details_data: [ ],
 *
 *					market_details_symbol: null,
 *
 * 				}
 *
 * */

// Reducer --> update --> Store
/**
 *
 * 	@param state {Object} Initial State of Store Data
 *
 * 	@param action {Object} with props: @type, @payload, @meta.status to Save to State
 *
 * 		@property type:
 * 			@String {TYPE_NAME} CAPITALIZED_ACTION_NAME --> examples: SET_DATA, UPDATE_DATA, etc...
 *
 * 		@property payload:
 * 			@Json {Array} or {Object}
 *
 * 		@property meta:
 * 			@property status:
 * 				@String {TYPE_STATE.state_name} CAPITALIZED_STATE_STATUS_NAME
 *
 * 		@example {
 *					type: 'SET_WATCHLIST_SYMBOLS',
 *					payload: [ 'NOAH/BTC, CCL/ETH', 'BTC/USDT' ],
 *			 		meta: { status: 'SUCCESS' }
 *			 	}
 *
 * */
export default (state = {

	// User
	auth_user: {},


	// List Symbols
	watchlist_symbols: [],

	ignore_list_symbols: [],


	// Data for Lists
	items_all: [],

	items: [],

	items_compound: [],

	all_markets: [],

	watchlist: [],

	ignore_list: [],


	// Compound Data Prefs
	is_2x_obo: null,
	is_2x: null,

	vol_last_to: null,
	vol_last_from: null,

	vol_past_to: null,
	vol_past_from: null,

	obo_last_to: null,
	obo_last_from: null,

	obo_past_to: null,
	obo_past_from: null,

	get_trades_last_to: null,
	get_trades_last_from: null,

	get_trades_past_to: null,
	get_trades_past_from: null,


	// Simple Data Prefs
	to: null,
	from: null,

	percent_props: null,
	init_props: {

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

	interval: 5,

	lower_bound: 1,
	upper_bound: null,

	show_watchlist: false,
	show_ignore_list: false,

	quote_state: null,

	min: null,
	max: null,


	// Other Props
	disable_ctrl: false,

	market_details: {},

	candle_data: [],


}, action) => {

	switch (action.type) {

		case SET_ITEMS_COMPOUND: {
			return {
				...state,
				items_compound: action.payload
			}
		}
		case IS_2X_OBO: {
			return {
				...state,
				is_2x_obo: action.payload
			}
		}
		case IS_2X: {
			return {
				...state,
				is_2x: action.payload
			}
		}
		case VOL_LAST_TO: {
			return {
				...state,
				vol_last_to: action.payload
			}
		}
		case VOL_LAST_FROM: {
			return {
				...state,
				vol_last_from: action.payload
			}
		}
		case VOL_PAST_TO: {
			return {
				...state,
				vol_past_to: action.payload
			}
		}
		case VOL_PAST_FROM: {
			return {
				...state,
				vol_past_from: action.payload
			}
		}

		case OBO_LAST_TO: {
			return {
				...state,
				obo_last_to: action.payload
			}
		}
		case OBO_LAST_FROM: {
			return {
				...state,
				obo_last_from: action.payload
			}
		}
		case OBO_PAST_TO: {
			return {
				...state,
				obo_past_to: action.payload
			}
		}
		case OBO_PAST_FROM: {
			return {
				...state,
				obo_past_from: action.payload
			}
		}
		case GET_TRADES_LAST_TO: {
			return {
				...state,
				get_trades_last_to: action.payload
			}
		}
		case GET_TRADES_LAST_FROM: {
			return {
				...state,
				get_trades_last_from: action.payload
			}
		}
		case GET_TRADES_PAST_TO: {
			return {
				...state,
				get_trades_past_to: action.payload
			}
		}
		case GET_TRADES_PAST_FROM: {
			return {
				...state,
				get_trades_past_from: action.payload
			}
		}
		case SET_MARKET_DETAILS: {

			// console.log(action.payload)

			let candle_data = action.payload.candle_data

			if (!candle_data) {
				candle_data = []
			} else {
				for (let i = 0; i < candle_data.length; i++) {
					candle_data[i].date = new Date(candle_data[i].timestamp)
				}
			}

			return {
				...state,
				market_details: action.payload.market_details,
				candle_data: candle_data,
			}
		}
		case SET_AUTH_USER: {
			// console.log(action.payload)
			return {
				...state,
				auth_user: action.payload
			}
		}
		case SET_ITEMS_ALL: {
			return {
				...state,
				items_all: action.payload,
			}
		}

		case SET_WATCHLIST_SYMBOLS: {
			return {
				...state,
				watchlist_symbols: action.payload
			}
		}
		case SET_WATCHLIST: {
			return {
				...state,
				watchlist: action.payload
			}
		}
		case SHOW_WATCHLIST: {
			return {
				...state,
				show_watchlist: action.payload
			}
		}
		case SET_ALL_MARKETS: {
			return {
				...state,
				all_markets: action.payload
			}
		}
		case SET_IGNORE_LIST_SYMBOLS: {
			return {
				...state,
				ignore_list_symbols: action.payload
			}
		}
		case SET_IGNORE_LIST: {
			return {
				...state,
				ignore_list: action.payload
			}
		}
		case SHOW_IGNORE_LIST: {
			return {
				...state,
				show_ignore_list: action.payload
			}
		}
		case SET_INTERVAL: {
			return {
				...state,
				interval: action.payload
			}
		}
		case SET_INIT_PROPS: {
			return {
				...state,
				init_props: action.payload
			}
		}
		case SET_PERCENT_PROPS: {
			return {
				...state,
				percent_props: action.payload
			}
		}
		case TO: {
			return {
				...state,
				to: action.payload
			}
		}
		case FROM: {
			return {
				...state,
				from: action.payload
			}
		}
		case LOWER_BOUND: {
			return {
				...state,
				lower_bound: action.payload
			}
		}
		case UPPER_BOUND: {
			return {
				...state,
				upper_bound: action.payload
			}
		}
		case QUOTE_STATE: {
			return {
				...state,
				quote_state: action.payload
			}
		}
		case MIN: {
			return {
				...state,
				min: action.payload
			}
		}
		case MAX: {
			return {
				...state,
				max: action.payload
			}
		}
		case SET_ITEMS: {
			return {
				...state,
				items: action.payload
			}
		}
		default:
			return state

	}

}