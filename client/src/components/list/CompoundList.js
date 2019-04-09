import React from 'react'

import { connect } from 'react-redux'

import * as utils from '../../util/utils'

import { _log, log } from '../../util/utils'

import { socket } from '../../redux/modules/socket_actions'

import _ from 'lodash'

import { DocumentCard } from 'office-ui-fabric-react/lib/DocumentCard'

import { TextField } from 'office-ui-fabric-react/lib/TextField'

import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip'

import { Toggle } from 'office-ui-fabric-react/lib/Toggle'

import { Icon } from 'office-ui-fabric-react/lib/Icon'

import { Label } from 'office-ui-fabric-react/lib/Label'

import { Link } from 'office-ui-fabric-react/lib/Link'

import { ActionButton, PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button'

import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner'

import ControlsNavBar from './ControlsNavBar'

import { WatchList } from './WatchList'

import { IgnoreList } from './IgnoreList'

import {
	WatchlistModal,
	MarketDetailsModal
} from '../modal/Modals'

import {
	IgnoreListModal
} from '../modal/ModalsIgnoreList'

import CompoundRangeFilter from './CompoundRangeFilter'

import FixedList from './FixedList'

import {

	___set_all_simple_data,

	___market_details,

	___set_prefs,

} from '../../index'

import { initializeIcons } from '@uifabric/icons'

initializeIcons()

const timeFormat = require('d3-time-format').timeFormat
const format_string = '%b %e,%_I:%M %p'
const formatDate = timeFormat(format_string)

let _items_compound = []

let _columns = []

let _my_interval

let _all_markets = []

let _watchlist_symbols = []

let _ignore_list_symbols = []

let _count = 0

let _is_2x_obo = 2

let _is_2x = 2

class CompoundList extends React.Component {

	constructor (props) {
		super(props)

		// Methods
		this._startInterval = this._startInterval.bind(this)
		this._stopInterval = this._stopInterval.bind(this)
		this._toggleDataUpdate = this._toggleDataUpdate.bind(this)

		// User Lists
		this._setWatchlist = this._setWatchlist.bind(this)
		this._setIgnoreList = this._setIgnoreList.bind(this)

		// Child Handlers
		this._tabsHandler = this._tabsHandler.bind(this)
		this._modalHandler = this._modalHandler.bind(this)
		this._modalListHandler = this._modalListHandler.bind(this)
		this._modalListHandlerIgnore = this._modalListHandlerIgnore.bind(this)
		this._onSelectVol2x = this._onSelectVol2x.bind(this)
		this._onSelectObo2x = this._onSelectObo2x.bind(this)

		// Modals
		this._closeMarketDetailsModal = this._closeMarketDetailsModal.bind(this)
		this._openMarketDetailsModal = this._openMarketDetailsModal.bind(this)
		this._openModal = this._openModal.bind(this)
		this._closeModal = this._closeModal.bind(this)

		// On Data
		this._onAllSimpleData = this._onAllSimpleData.bind(this)
		this._onCompoundData = this._onCompoundData.bind(this)

		// Socket.io
		socket.on('market_details', (data) => {

			___market_details(data)

			this.setState({
				market_details: data.market_details,
				candle_data: data.candle_data,
			})

		})

		socket.on('all_simple_data', (data) => {

			___set_prefs(data.prefs)

			this._onAllSimpleData(data)

		})

		socket.on('compound_data', (data) => {

			___set_prefs(data.prefs)

			this._onCompoundData(data)

		})

		let items_compound = this.props.items_compound

		let watchlist_symbols = this.props.watchlist_symbols

		let ignore_list_symbols = this.props.ignore_list_symbols

		for (let i = 0; i < items_compound.length; i++) {

			if (watchlist_symbols.includes(items_compound[i].symbol)) {
				items_compound[i].is_watchlist = true
			}
			else {
				items_compound[i].is_watchlist = false
			}

			if (ignore_list_symbols.includes(items_compound[i].symbol)) {
				items_compound[i].is_ignore_list = true
			}
			else {
				items_compound[i].is_ignore_list = false
			}

		}

		this.state = {

			marketDetailsModalIsOpen: false,

			hide_ignore_list_modal: true,

			hide_watchlist_modal: true,

			symbol: null,

			filters_visible: true,

			watchlist_visible: false,

			ignore_list_visible: false,

			data_updating: true,

			is_compact: false,

			my_interval: null,


			// User
			auth_user: this.props.auth_user,


			// User List symbols
			watchlist_symbols: this.props.watchlist_symbols,
			ignore_list_symbols: this.props.ignore_list_symbols,

			// User List Symbols Visibility
			show_watchlist: this.props.show_watchlist,
			show_ignore_list: this.props.show_ignore_list,


			// User List Data
			items_compound: this.props.items_compound,

			items_all: this.props.items_all,

			all_markets: this.props.all_markets,

			watchlist: this.props.watchlist,

			ignore_list: this.props.ignore_list,


			// Compound Data Prefs
			is_2x_obo: this.props.is_2x_obo,
			is_2x: this.props.is_2x,

			vol_last_to: 	this.props.vol_last_to,
			vol_last_from: 	this.props.vol_last_from,

			vol_past_to: 	this.props.vol_past_to,
			vol_past_from: 	this.props.vol_past_from,

			obo_last_to: 	this.props.obo_last_to,
			obo_last_from: 	this.props.obo_last_from,

			obo_past_to: 	this.props.obo_past_to,
			obo_past_from: 	this.props.obo_past_from,

			get_trades_last_to: 	this.props.get_trades_last_to,
			get_trades_last_from: 	this.props.get_trades_last_from,

			get_trades_past_to: 	this.props.get_trades_past_to,
			get_trades_past_from: 	this.props.get_trades_past_from,


			// Simple Data Prefs
			to: this.props.to,
			from: this.props.from,

			percent_props: this.props.percent_props,

			interval: this.props.interval,

			lower_bound: this.props.lower_bound,
			upper_bound: this.props.upper_bound,

			quote_state: this.props.quote_state,

			min: this.props.min,
			max: this.props.max,


			// Other Props
			disable_ctrl: this.props.disable_ctrl,

			market_details: this.props.market_details,

			candle_data: this.props.candle_data,

		}

	}

	_onAllSimpleData (data) {

		let all_simple_data = data.all_simple_data

		let prefs = data.prefs

		// List Data
		let items_all = all_simple_data.items_all

		for (let i = 0; i < items_all.length; i++) {

			if (prefs._watchlist_symbols.includes(items_all[i].symbol)) {
				items_all[i].is_watchlist = true
			}
			else {
				items_all[i].is_watchlist = false
			}

			if (prefs._ignore_list_symbols.includes(items_all[i].symbol)) {
				items_all[i].is_ignore_list = true
			}
			else {
				items_all[i].is_ignore_list = false
			}
		}

		let all_markets = all_simple_data.all_markets

		for (let i = 0; i < all_markets.length; i++) {

			if (prefs._watchlist_symbols.includes(all_markets[i].symbol)) {
				all_markets[i].is_watchlist = true
			}
			else {
				all_markets[i].is_watchlist = false
			}

			if (prefs._ignore_list_symbols.includes(all_markets[i].symbol)) {
				all_markets[i].is_ignore_list = true
			}
			else {
				all_markets[i].is_ignore_list = false
			}
		}

		___set_all_simple_data({ items_all, all_markets })

		// State Updates
		let update_state = {

			// list symbols
			watchlist_symbols: prefs._watchlist_symbols,

			ignore_list_symbols: prefs._ignore_list_symbols,


			// List Data
			items_all: items_all,

			all_markets: all_markets,


			// Compound Data Prefs
			is_2x_obo: prefs._is_2x_obo,
			is_2x: prefs._is_2x,

			vol_last_to: 	prefs._vol_last_to,
			vol_last_from: 	prefs._vol_last_from,

			vol_past_to: 	prefs._vol_past_to,
			vol_past_from: 	prefs._vol_past_from,

			obo_last_to: 	prefs._obo_last_to,
			obo_last_from: 	prefs._obo_last_from,

			obo_past_to: 	prefs._obo_past_to,
			obo_past_from: 	prefs._obo_past_from,

			get_trades_last_to: 	prefs._get_trades_last_to,
			get_trades_last_from: 	prefs._get_trades_last_from,

			get_trades_past_to: 	prefs._get_trades_past_to,
			get_trades_past_from: 	prefs._get_trades_past_from,


			// Simple Data Prefs
			to: prefs._to,
			from: prefs._from,

			percent_props: prefs._percent_props,

			interval: prefs._interval,

			lower_bound: prefs._lower_bound,
			upper_bound: prefs._upper_bound,

			show_watchlist: prefs._show_watchlist,
			show_ignore_list: prefs._show_ignore_list,

			quote_state: prefs._quote_state,

		}

		this.setState(update_state)

	}

	_onCompoundData (data) {

		let items_compound = data.items_compound

		let prefs = data.prefs

		let is_2x = prefs._is_2x

		let is_2x_obo = prefs._is_2x_obo

		let watchlist_symbols = prefs._watchlist_symbols

		let ignore_list_symbols = prefs._ignore_list_symbols

		for (let i = 0; i < items_compound.length; i++) {

			if (ignore_list_symbols.includes(items_compound[i].symbol)) {
				items_compound[i].is_ignore_list = true
			}
			else {
				items_compound[i].is_ignore_list = false
			}

			if (watchlist_symbols.includes(items_compound[i].symbol)) {
				items_compound[i].is_watchlist = true
			}
			else {
				items_compound[i].is_watchlist = false
			}

		}

		items_compound = _.filter(items_compound, (obj) => {

			return obj[`vol_quote_is_${is_2x}x`]

		})

		let update = {

			items_compound,

			prefs,

			is_2x,

			is_2x_obo,

			watchlist_symbols,

			ignore_list_symbols,

		}

		this.setState(update)

	}

	componentWillReceiveProps(newProps) {

		const {

			auth_user,
			market_details,
			candle_data

		} = newProps

		this.setState({
			auth_user: auth_user,
			market_details: market_details,
			candle_data: candle_data,
		})

		if (_count === 0) {
			this._startInterval(auth_user)
		}

	}

	componentWillUnmount () {

		_count = 0

		clearInterval(_my_interval)

		this.setState({
			my_interval: null
		})
	}

	_startInterval (auth_user) {

		let _data = {
			auth_user: auth_user,
			component: 'CompoundList',
			method: '_startInterval',
		}

		if (_count === 0) {
			socket.emit('get_all_simple_data', _data)
			socket.emit('get_compound_data', _data)
			_count++
		}

		_my_interval = setInterval(() => {

			socket.emit('get_compound_data', _data)

		}, 30000)

		this.setState({
			my_interval: _my_interval
		})

	}

	_stopInterval () {

		clearInterval(_my_interval)

		this.setState({
			my_interval: null
		})
	}

	_toggleDataUpdate (e, is_checked) {

	}

	_tabsHandler (update) {

		this.setState(update)

	}

	_setWatchlist (e, is_watchlist, symbol) {

		log.blue('_setWatchlist')

		const { all_markets, watchlist_symbols, items_compound } = this.state

		if (is_watchlist) {

			_.remove(watchlist_symbols, (str) => {
				return str === symbol
			})

			_items_compound = []
			_all_markets = []

			_items_compound = _.map(items_compound, (obj) => {
				if (watchlist_symbols.includes(obj.symbol)) {
					obj.is_watchlist = true
				} else {
					obj.is_watchlist = false
				}
				return obj
			})

			_all_markets = _.map(all_markets, (obj) => {
				if (watchlist_symbols.includes(obj.symbol)) {
					obj.is_watchlist = true
				} else {
					obj.is_watchlist = false
				}
				return obj
			})

			this.setState({
				items_compound: _items_compound,
				watchlist_symbols: watchlist_symbols,
				all_markets: _all_markets
			})

			let data = {
				side: 'watchlist_symbols',
				name: 'watchlist_symbols',
				prop: '_watchlist_symbols',
				auth_user: this.state.auth_user,
				value: watchlist_symbols
			}

			socket.emit('set_watchlist_symbols', data)

		} else {

			let _set_watchlist_symbols = utils._set(watchlist_symbols, symbol)

			_items_compound = []
			_all_markets = []

			_items_compound = _.map(items_compound, (obj) => {
				if (_set_watchlist_symbols.includes(obj.symbol)) {
					obj.is_watchlist = true
				} else {
					obj.is_watchlist = false
				}
				return obj
			})

			_all_markets = _.map(all_markets, (obj) => {
				if (_set_watchlist_symbols.includes(obj.symbol)) {
					obj.is_watchlist = true
				} else {
					obj.is_watchlist = false
				}
				return obj
			})

			this.setState({
				items_compound: _items_compound,
				watchlist_symbols: _set_watchlist_symbols,
				all_markets: _all_markets
			})

			let data = {
				side: 'watchlist_symbols',
				name: 'watchlist_symbols',
				prop: '_watchlist_symbols',
				auth_user: this.state.auth_user,
				value: _set_watchlist_symbols
			}

			socket.emit('set_watchlist_symbols', data)

		}

	}

	_setIgnoreList (e, is_ignore_list, symbol) {

		log.red('_setIgnoreList')

		const { all_markets, ignore_list_symbols, items_compound } = this.state

		if (is_ignore_list) {

			_.remove(ignore_list_symbols, (str) => {
				return str === symbol
			})

			_items_compound = []

			_all_markets = []

			_items_compound = _.map(items_compound, (obj) => {
				if (ignore_list_symbols.includes(obj.symbol)) {
					obj.is_ignore_list = true
				} else {
					obj.is_ignore_list = false
				}
				return obj
			})

			_all_markets = _.map(all_markets, (obj) => {
				if (ignore_list_symbols.includes(obj.symbol)) {
					obj.is_ignore_list = true
				} else {
					obj.is_ignore_list = false
				}
				return obj
			})

			this.setState({
				items_compound: _.filter(_items_compound, (obj) => {
				    return !obj.is_ignore_list
				}),
				ignore_list_symbols: ignore_list_symbols,
				all_markets: _all_markets
			})

			let data = {
				side: 'ignore_list_symbols',
				name: 'ignore_list_symbols',
				prop: '_ignore_list_symbols',
				auth_user: this.state.auth_user,
				value: ignore_list_symbols
			}

			socket.emit('set_ignore_list_symbols', data)

		} else {

			let _set_ignore_list_symbols = utils._set(ignore_list_symbols, symbol)

			_items_compound = []

			_all_markets = []

			_items_compound = _.map(items_compound, (obj) => {
				if (_set_ignore_list_symbols.includes(obj.symbol)) {
					obj.is_ignore_list = true
				} else {
					obj.is_ignore_list = false
				}
				return obj
			})

			_all_markets = _.map(all_markets, (obj) => {
				if (_set_ignore_list_symbols.includes(obj.symbol)) {
					obj.is_ignore_list = true
				} else {
					obj.is_ignore_list = false
				}
				return obj
			})

			this.setState({
				items_compound: _.filter(_items_compound, (obj) => {
					return !obj.is_ignore_list
				}),
				ignore_list_symbols: _set_ignore_list_symbols,
				all_markets: _all_markets
			})

			let data = {
				side: 'ignore_list_symbols',
				name: 'ignore_list_symbols',
				prop: '_ignore_list_symbols',
				auth_user: this.state.auth_user,
				value: _set_ignore_list_symbols
			}

			socket.emit('set_ignore_list_symbols', data)

		}

	}

	_closeModal (e, modal_id) {

		if (modal_id === 'watchlist_modal') {
			this.setState({
				hide_watchlist_modal: true
			})
		}
		else if (modal_id === 'ignore_list_modal') {
			this.setState({
				hide_ignore_list_modal: true
			})
		}

	}

	_openModal (e, modal_id) {

		if (modal_id === 'watchlist_modal') {
			this.setState({
				hide_watchlist_modal: false
			})
		}
		else if (modal_id === 'ignore_list_modal') {
			this.setState({
				hide_ignore_list_modal: false
			})
		}

	}

	_closeMarketDetailsModal () {

		this.setState({
			marketDetailsModalIsOpen: false,
			symbol: null
		})

	}

	_openMarketDetailsModal (e, details) {

		console.log(this.props)


		details.interval = this.state.interval

		socket.emit('get_market_details', details)

		this.setState({
			market_details: details,
			marketDetailsModalIsOpen: true,
			symbol: details.symbol,
		})

	}

	_modalHandler (e, data) {

		this._openMarketDetailsModal(e, data)

	}

	_modalListHandler (e, is_watchlist, symbol) {

		this._setWatchlist(e, is_watchlist, symbol)

	}

	_modalListHandlerIgnore (e, is_ignore_list, symbol) {

		this._setIgnoreList(e, is_ignore_list, symbol)

	}

	_onSelectObo2x (e, item) {

		_log.alert('_onSelectObo2x')
		log.yellow(item)

		_is_2x_obo = +item.key

		this.setState({
			columns: _columns,
			is_2x_obo: _is_2x_obo,
		})

	}

	_onSelectVol2x (e, item) {

		// _log.warn('_onChangeHandler')
		// log.magenta(item)

		const { is_2x_obo } = this.state

		_is_2x_obo = is_2x_obo

		_is_2x = +item.key

		// List Columns
		_columns = [

			{
				key: 'is_watchlist',
				name: <TooltipHost content={'Watchlist'}><Icon iconName="RedEye" className={'icon-list-header icon-list-header-watchlist'}/></TooltipHost>,
				fieldName: 'is_watchlist',
				minWidth: 18,
				maxWidth: 18,
				isResizable: false,
				isCollapsable: false,
				data: 'string',
				onColumnClick: function () {
					_log.cyan('is_watchlist --> no sort')
				},
				onRender: (item) => {

					let _id = `${item.market_name}__simple_data`

					return (
						<i id={_id}
						   className={item.is_watchlist ? 'ms-Icon ms-Icon--RedEye is-watchlist' : 'ms-Icon ms-Icon--RedEye not-watchlist'}
						   onClick={(e) => this._setWatchlist(e, item.is_watchlist, item.symbol)}
						   aria-hidden="true"></i>
					)

				},
				isPadded: false,
				className: 'nav-cell'
			},

			{
				key: 'is_ignore_list',
				name: <TooltipHost content={'Ignore'}><Icon iconName="Blocked" className={'icon-list-header icon-list-header-ignore-list'}/></TooltipHost>,
				fieldName: 'is_ignore_list',
				minWidth: 18,
				maxWidth: 18,
				isResizable: false,
				isCollapsable: false,
				data: 'string',
				onColumnClick: function () {
					_log.green('is_ignore_list --> no sort')
				},
				onRender: (item) => {

					let _id = item.market_name + '__mainlist_ignore_list'

					return (
						<i id={_id}
						   className={'ms-Icon ms-Icon--Blocked not-ignore-list'}
						   onClick={(e) => this._setIgnoreList(e, item.is_ignore_list, item.symbol)}
						   aria-hidden="true"></i>
					)

				},
				isPadded: false,
				className: 'nav-cell'
			},

			{
				key: 'symbol',
				name: 'Symbol',
				fieldName: 'symbol',
				minWidth: 56,
				maxWidth: 56,
				isResizable: true,
				isCollapsable: true,
				data: 'string',
				onColumnClick: this._onColumnClick,
				onRender: (details) => {
					return (
						<div className={'link-btn'} >
							<Link onClick={(e) => this._openMarketDetailsModal(e, details)}>{details.symbol}</Link>
						</div>
					)
				},
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'symbol-header',
			},

			{
				key: 'timestamp',
				name: 'Update',
				fieldName: 'timestamp',
				minWidth: 84,
				maxWidth: 84,
				isRowHeader: false,
				isResizable: true,
				isSorted: true,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					let _timestamp = item.timestamp

					if (item.close_timestamp) {
						_timestamp = item.close_timestamp
					}

					let _last_update = utils._time_from_now(_timestamp)

					return (<span className={'nav-cell-usd'}>{_last_update}</span>)

				},
				data: 'string',
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'update-header',
			},

			{
				key: 'vol_quote_avg_1hr',
				name: 'Vol Avg (A)',
				fieldName: 'vol_quote_avg_1hr',
				minWidth: 84,
				maxWidth: 84,
				isRowHeader: false,
				isResizable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					return (<span className={'nav-cell-usd'}>{utils.numFormat(item.vol_quote_avg_1hr)}</span>)

				},
				data: 'string',
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'vol-quote-header',
			},

			{
				key: 'vol_quote_avg_60hr',
				name: 'Vol Avg (B)',
				fieldName: 'vol_quote_avg_60hr',
				minWidth: 84,
				maxWidth: 84,
				isRowHeader: false,
				isResizable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					return (<span className={'nav-cell-usd'}>{utils.numFormat(item.vol_quote_avg_60hr)}</span>)

				},
				data: 'string',
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'vol-quote-header',
			},

			{
				key: 'vol_quote_percent_diff',
				name: 'Vol Avg % diff',
				fieldName: 'vol_quote_percent_diff',
				minWidth: 84,
				maxWidth: 84,
				isRowHeader: false,
				isResizable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					let percentage = `${_.round(item.vol_quote_percent_diff, 0)} %`

					return (<span className={'nav-cell-usd'}>{percentage}</span>)

				},
				data: 'string',
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'vol-quote-header',
			},

			{
				key: `vol_quote_is_${_is_2x}x`,
				name: `Vol Avg is ${_is_2x}x`,
				fieldName: `vol_quote_is_${_is_2x}x`,
				minWidth: 72,
				maxWidth: 72,
				isRowHeader: false,
				isResizable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					if (item[`vol_quote_is_${_is_2x}x`]) {
						return (
							<i className={'ms-Icon ms-Icon--SkypeCircleCheck icon-is_2x'} aria-hidden={'true'}></i>
						)
					}
					else {
						return null

					}

				},
				data: 'string',
				isPadded: false,
				className: 'is_2x',
				headerClassName: 'vol-quote-header',
			},

			{
				key: `bids_is_${_is_2x_obo}x`,
				name: `OB Bids ${_is_2x_obo}x`,
				fieldName: `bids_is_${_is_2x_obo}x`,
				minWidth: 84,
				maxWidth: 84,
				isRowHeader: false,
				isResizable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					if (item[`bids_is_${_is_2x_obo}x`]) {
						return (
							<i className={'ms-Icon ms-Icon--SkypeCircleCheck icon-obo'} aria-hidden={'true'}></i>
						)
					}
					else {
						return null
					}

				},
				data: 'string',
				isPadded: false,
				className: 'is_2x',
				headerClassName: 'obo-header',

			},

			{
				key: `asks_is_${_is_2x_obo}x`,
				name: `OB Asks ${_is_2x_obo}x`,
				fieldName: `asks_is_${_is_2x_obo}x`,
				minWidth: 84,
				maxWidth: 84,
				isRowHeader: false,
				isResizable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					if (item[`asks_is_${_is_2x_obo}x`]) {
						return (
							<i className={'ms-Icon ms-Icon--SkypeCircleCheck icon-obo'} aria-hidden={'true'}></i>
						)
					}
					else {
						return null
					}

				},
				data: 'string',
				isPadded: false,
				className: 'is_2x',
				headerClassName: 'obo-header',

			},



			{
				key: 'doc_count',
				name: 'doc_count',
				fieldName: 'doc_count',
				minWidth: 84,
				maxWidth: 84,
				isRowHeader: false,
				isResizable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					return (
						<span>{item.doc_count}</span>
					)

				},
				data: 'string',
				isPadded: false,
				className: 'doc-count',

			},

		]

		this.setState({
			columns: _columns,
			is_2x: _is_2x,
		})

	}

	render () {

		const {

			items_compound,

			all_markets,

			watchlist_symbols,

			ignore_list_symbols,

			is_2x,

			is_2x_obo,

			market_details,

			candle_data,

			filters_visible,

			watchlist_visible,

			ignore_list_visible,

		} = this.state


		const spinner = () => {
			return (
				<div className={'percent-change-filer__spinner'}>
					<Spinner size={SpinnerSize.large} label={'Loading compound filters...'} ariaLive="assertive" labelPosition="left" />
				</div>
			)
		}

		return (
			<div className={'list-simple'}>


				{/* ================== COMPOUND DATA TABLE ================== */}
				<section id={'table'}>

					{items_compound.length > 0 ? <FixedList id={'compound_list'}
														    items={items_compound}
														    all_markets={all_markets}
														    watchlist_symbols={watchlist_symbols}
														    ignore_list_symbols={ignore_list_symbols}
														    is_2x={is_2x}
														    is_2x_obo={is_2x_obo}
														    _setWatchlist={this._setWatchlist}
														    _setIgnoreList={this._setIgnoreList}
														    _openMarketDetailsModal={this._openMarketDetailsModal} /> : null
					}

				</section>



				{/* ================== NAV CONTROLS ================== */}

				<section id={'controls'}>

					<div id="controls_nav_bar">
						<DocumentCard className={'card controls-nav-card'}>
							<ControlsNavBar tabsHandler={this._tabsHandler} enable_filters={this.state.interval} />
						</DocumentCard>
					</div>



					{/* ================== COMPOUND RANGE FILTERS ================== */}

					{is_2x && is_2x_obo ? null : spinner()}

					{filters_visible ? <div id={'filters'} className={'control-list-item'}>

														<div id={'percent_change_list'}>
															{is_2x && is_2x_obo ? <CompoundRangeFilter id={'compound_range_filter'}
																									   _setWatchlist={this._setWatchlist}
																									   _onSelectObo2x={this._onSelectObo2x}
																									   _onSelectVol2x={this._onSelectVol2x} /> : null
															}
														</div>

													</div> : null
					}



					{/* ================== WATCHLIST ================== */}

					{watchlist_visible ? <div id={'watchlist'} className={'control-list-item'}>

														<DocumentCard className={'card pivot-card'}>

															<div className={'list-header'}>

																<ActionButton data-automation-id="watchlist_modal"
																			  iconProps={{iconName: 'Add'}}
																			  onClick={(e) => {this._openModal(e, 'watchlist_modal')}}>

																	Watchlist

																</ActionButton>

															</div>

															{watchlist_symbols.length > 0 ? <WatchList list_id={'watchlist_controls'}
																									   all_markets={all_markets}
																									   watchlist_symbols={watchlist_symbols}
																									   _setWatchlist={this._setWatchlist}
																									   _modalHandler={this._modalHandler} /> : null
															}

														</DocumentCard>

													</div> : null}



					{/* ================== IGNORE LIST ================== */}

					{ignore_list_visible ? <div id={'ignore_list'} className={'control-list-item'}>

														<DocumentCard className={'card pivot-card'}>

															<div className={'list-header'}>

																<ActionButton data-automation-id="ignore_list_modal"
																			  iconProps={{iconName: 'Add'}}
																			  onClick={(e) => {this._openModal(e, 'ignore_list_modal')}}>

																	Ignore List

																</ActionButton>

															</div>

															{ignore_list_symbols.length > 0 ? <IgnoreList list_id={'ignore_list_controls'}
																										  all_markets={all_markets}
																										  ignore_list_symbols={ignore_list_symbols}
																										  _setIgnoreList={this._setIgnoreList}
																										  _modalHandler={this._modalHandler} /> : null
															}

														</DocumentCard>

													</div> : null}

				</section>



				{/* IGNORE LIST MODAL */}
				<IgnoreListModal id={'ignore_list_modal'}
								 container_class={'watchlist-modal-wrapper'}
								 title={'Ignore List'}
								 sub_text={'Add or remove markets from your ignore list'}
								 hide_dialog={this.state.hide_ignore_list_modal}
								 ignore_list_symbols={ignore_list_symbols}
								 all_markets={all_markets}
								 _closeModal={(e) => {this._closeModal(e, 'ignore_list_modal')}}
								 _modalListHandlerIgnore={this._modalListHandlerIgnore}
								 _modalHandler={this._modalHandler} />


				{/* WATCHLIST MODAL */}
				<WatchlistModal id={'watchlist_modal'}
								container_class={'watchlist-modal-wrapper'}
								title={'Watchlist'}
								sub_text={'Add or remove markets from your watchlist'}
								hide_dialog={this.state.hide_watchlist_modal}
								watchlist_symbols={watchlist_symbols}
								all_markets={all_markets}
								_closeModal={(e) => {this._closeModal(e, 'watchlist_modal')}}
								_modalListHandler={this._modalListHandler}
								_modalHandler={this._modalHandler} />


				{/* MARKET DETAILS MODAL */}
				{market_details ? <MarketDetailsModal id={'market_details_modal'}
													  is_open={this.state.marketDetailsModalIsOpen}
													  candle_data={candle_data}
													  market_details={market_details}
													  _onRequestClose={this._closeMarketDetailsModal} /> : null}

			</div>
		)

	}

}

function mapStateToProps (state) {

	return {
		...state.allSimpleData
	}

}

export default connect(
	mapStateToProps
)(CompoundList)