import io from 'socket.io-client'

const log = require('ololog').configure({locate: false})

let _socket

const endpoint = {
	production: {
		transports: ['websocket'],
		secure: true,
	},
	development: 'http://localhost:6001/'
}

let ssl = (window.location.protocol === 'https:')
if (ssl) {
	_socket = io.connect('/', endpoint.production)
} else {
	_socket = io.connect(endpoint.development)
}

export const socket = _socket

export function setAuthenticated (bool) {
	log.magenta('setItems --> SET_AUTHENTICATED', bool)
	return {
		type: 'SET_AUTHENTICATED',
		payload: bool
	}
}

export function setUpdate (bool) {
	log.magenta('setItems --> SET_UPDATE', bool)
	return {
		type: 'SET_UPDATE',
		payload: bool
	}
}

export function setItems (arr) {
	// log.magenta('setItems --> ACTION_SET_ITEMS')
	console.log(arr)
	return {
		type: 'ACTION_SET_ITEMS',
		payload: arr
	}
}

export function setItemsQFL (arr) {
	// log.magenta('setItems --> SET_ITEMS_QFL')
	// console.log(arr)
	return {
		type: 'SET_ITEMS_QFL',
		payload: arr
	}
}

export function setIgnoreListSymbols (arr) {
	log.magenta('actions --> SET_IGNORE_LIST_SYMBOLS', arr)
	return {
		type: 'SET_IGNORE_LIST_SYMBOLS',
		payload: arr

	}
}

export function setIgnoreList (arr) {
	//log.magenta('actions --> SET_IGNORE_LIST', arr)
	return {
		type: 'SET_IGNORE_LIST',
		payload: arr

	}
}

export function setAllWatchlistMarketsIgnoreList (arr) {
	//log.magenta('actions --> SET_ALL_MARKETS_IGNORE_LIST', arr)
	return {
		type: 'SET_ALL_MARKETS_IGNORE_LIST',
		payload: arr

	}
}

export function setAllWatchlistMarkets (arr) {
	//log.magenta('actions --> SET_ALL_MARKETS', arr)
	return {
		type: 'SET_ALL_MARKETS',
		payload: arr

	}
}

export function setWatchlist (arr) {
	//log.magenta('actions --> SET_WATCHLIST', arr)
	return {
		type: 'SET_WATCHLIST',
		payload: arr

	}
}

export function setWatchlistSymbols (arr) {
	//log.magenta('actions --> SET_WATCHLIST_SYMBOLS', arr)
	return {
		type: 'SET_WATCHLIST_SYMBOLS',
		payload: arr

	}
}

export function setInterval (integer) {
	//log.magenta('actions --> SET_INTERVAL', integer)
	return {
		type: 'SET_INTERVAL',
		payload: integer

	}
}

export function setProps (props_obj) {
	// log.magenta('actions --> SET_PERCENT_PROPS', props_obj)
	return {
		type: 'SET_PERCENT_PROPS',
		payload: props_obj

	}
}

export function lowerBound (number) {
	// log.blue('LOWER_BOUND', number)
	return {
		type: 'LOWER_BOUND',
		payload: number
 	}
}

export function upperBound (number) {
	// log.red('UPPER_BOUND', number)
	return {
		type: 'UPPER_BOUND',
		payload: number
	}
}

export function compare (arr) {
	// log.yellow('COMPARE', arr)
	return {
		type: 'COMPARE',
		payload: arr
	}
}

export function quoteSearch (arr) {
	// log.yellow('QUOTE_SEARCH', arr.length)
	return {
		type: 'QUOTE_SEARCH',
		payload: arr
	}
}

export function _from (minutes) {
	// log.blue('FROM', minutes)
	return {
		type: 'FROM',
		payload: minutes
	}
}

export function _to (minutes) {
	// log.red('TO', minutes)
	return {
		type: 'TO',
		payload: minutes
	}
}