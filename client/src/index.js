import './assets/stylesheets/base.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import 'normalize.css'
import configureStore from './redux'
import Header from './components/header/header'
import Routes from './routes/'
import _ from 'lodash'
import { _log, log } from './util/utils'

import { socket } from './redux/modules/socket_actions'

import registerServiceWorker from './registerServiceWorker'

socket.on('cache_id', (id) => {

	let cache_id = localStorage.getItem('cache_id')

	if (!cache_id || +cache_id !== id) {

		localStorage.setItem('cache_id', id)

		_log.blood('redeploy: clear cache')

		setTimeout(() => {

			window.location.reload(true)

		}, 10000)
	}
	else {

		_log.green('all is well')

	}

})

const store = configureStore()

export function ___set_auth_user (data) {

	store.dispatch({type: 'SET_AUTH_USER', payload: data})

}

export function ___market_details (data) {

	store.dispatch({type: 'SET_MARKET_DETAILS', payload: data})

}

export function ___set_prefs (prefs) {

	// console.log('prefs', prefs)

	store.dispatch({type: 'MIN', payload: prefs._min})

	store.dispatch({type: 'MAX', payload: prefs._max})

	store.dispatch({type: 'TO', payload: -(Math.abs(prefs._to))})
	store.dispatch({type: 'FROM', payload: -(Math.abs(prefs._from))})

	store.dispatch({type: 'SET_PERCENT_PROPS', payload: prefs._percent_props})

	store.dispatch({type: 'SET_INTERVAL', payload: prefs._interval})

	store.dispatch({type: 'LOWER_BOUND', payload: prefs._lower_bound})
	store.dispatch({type: 'UPPER_BOUND', payload: _.round(prefs._upper_bound)})

	store.dispatch({type: 'SET_WATCHLIST_SYMBOLS', payload: prefs._watchlist_symbols})
	store.dispatch({type: 'SET_IGNORE_LIST_SYMBOLS', payload: prefs._ignore_list_symbols})

	store.dispatch({type: 'SHOW_WATCHLIST', payload: prefs._show_watchlist})
	store.dispatch({type: 'SHOW_IGNORE_LIST', payload: prefs._show_ignore_list})

	store.dispatch({type: 'QUOTE_STATE', payload: prefs._quote_state})

	store.dispatch({type: 'IS_2X', payload: prefs._is_2x})

	store.dispatch({type: 'IS_2X_OBO', payload: prefs._is_2x_obo})

	store.dispatch({type: 'VOL_LAST_TO', 	payload: prefs._vol_last_to})
	store.dispatch({type: 'VOL_LAST_FROM', 	payload: prefs._vol_last_from})
	store.dispatch({type: 'VOL_PAST_TO', 	payload: prefs._vol_past_to})
	store.dispatch({type: 'VOL_PAST_FROM', 	payload: prefs._vol_past_from})

	store.dispatch({type: 'OBO_LAST_TO', 	payload: prefs._obo_last_to})
	store.dispatch({type: 'OBO_LAST_FROM', 	payload: prefs._obo_last_from})
	store.dispatch({type: 'OBO_PAST_TO', 	payload: prefs._obo_past_to})
	store.dispatch({type: 'OBO_PAST_FROM', 	payload: prefs._obo_past_from})

	store.dispatch({type: 'GET_TRADES_LAST_TO', 	payload: prefs._get_trades_last_to})
	store.dispatch({type: 'GET_TRADES_LAST_FROM', 	payload: prefs._get_trades_last_from})
	store.dispatch({type: 'GET_TRADES_PAST_TO', 	payload: prefs._get_trades_past_to})
	store.dispatch({type: 'GET_TRADES_PAST_FROM', 	payload: prefs._get_trades_past_from})

}

export function ___set_all_simple_data (data) {

	store.dispatch({type: 'SET_ITEMS_ALL', payload: data.items_all})

	store.dispatch({type: 'SET_ALL_MARKETS', payload: data.all_markets})

}

export function ___new_interval (integer) {

	store.dispatch({type: 'SET_INTERVAL', payload: integer, meta: {status: 'SET_INTERVAL'}})

}

export function ___set_percent_props (percent_props) {

	store.dispatch({type: 'SET_PERCENT_PROPS', payload: percent_props})

}

export function ___filter_by_quote (quote_state) {

	store.dispatch({type: 'QUOTE_STATE', payload: quote_state})

}


// Redirect all to /simple_list or login
let window_location = window.location

// log.yellow(window_location)
if (window_location.pathname === '/') {
	window_location.pathname = '/simple_list'
}

ReactDOM.render((
	<Provider store={store}>
		<BrowserRouter>
			<div className="app-container">
				<Header/>
				<main>
					<Routes/>
				</main>
			</div>
		</BrowserRouter>
	</Provider>
), document.getElementById('root'))

// Enable hot reloading
module.hot.accept()

registerServiceWorker()