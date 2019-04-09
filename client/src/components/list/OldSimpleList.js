import React from 'react'

import { connect } from 'react-redux'

import * as utils from '../../util/utils'

import { _log, log } from '../../util/utils'

import { socket } from '../../redux/modules/socket_actions'

import _ from 'lodash'

import { DocumentCard, DocumentCardTitle } from 'office-ui-fabric-react/lib/DocumentCard'

import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList'

import { TextField } from 'office-ui-fabric-react/lib/TextField'

import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip'

import { Toggle } from 'office-ui-fabric-react/lib/Toggle'

import { Icon } from 'office-ui-fabric-react/lib/Icon'

import { Label } from 'office-ui-fabric-react/lib/Label'

import { Link } from 'office-ui-fabric-react/lib/Link'

import { ActionButton, PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button'

import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner'

import SliderInterval from './SliderInterval'

import PercentChangeList from './PercentChangeList'

import VolumeCtrl from './VolumeCtrl'

import QuoteCtrl from './QuoteCtrl'

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

import {

	___set_all_simple_data,

	___set_prefs,

	___market_details,

	___set_auth_user,

} from '../../index'

import { initializeIcons } from '@uifabric/icons'

initializeIcons()

const timeFormat = require('d3-time-format').timeFormat
const format_string = '%b %e,%_I:%M %p'
const formatDate = timeFormat(format_string)

class SimpleTable extends DetailsList {}

let _items = []

let _items_all = []

let _columns = []

let _columns_view = {

	id: false,
	market_id: false,
	base: false,
	quote: false,
	quote_raw: false,
	symbol: false,
	pairing: false,
	pairing_raw: false,
	market_name: false,
	date: false,
	date_string: false,
	timestamp: false,
	interval: false,
	open: false,
	close: false,
	close_timestamp: false,
	high: false,
	low: false,
	volume: false,
	volume_quote: false,
	candle_count: false,

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
	low_high: true,

	volume_quote_btc_5m: false,
	volume_quote_btc_15m: false,
	volume_quote_btc_24h: false,
	count_pass: false,
	is_watchlist: false,
	is_ignore_list: false

}


let _my_interval

let _interval

let _quote_state

let _watchlist = []

let _watchlist_symbols = []

let _all_markets = []

let _ignore_list_symbols = []

let _count = 0

class SimpleList extends React.Component {

	constructor (props) {
		super(props)

		this._startInterval = this._startInterval.bind(this)
		this._stopInterval = this._stopInterval.bind(this)
		this._onSearch = this._onSearch.bind(this)

		this._toggleDataUpdate = this._toggleDataUpdate.bind(this)

		// Columns
		this._onColumnClick = this._onColumnClick.bind(this)
		this._sortItems = this._sortItems.bind(this)
		this._setWatchlist = this._setWatchlist.bind(this)
		this._setIgnoreList = this._setIgnoreList.bind(this)

		// Child Handlers
		this._tabsHandler = this._tabsHandler.bind(this)
		this._modalHandler = this._modalHandler.bind(this)
		this._modalListHandler = this._modalListHandler.bind(this)
		this._modalListHandlerIgnore = this._modalListHandlerIgnore.bind(this)


		// Market Details Modal
		this._closeMarketDetailsModal = this._closeMarketDetailsModal.bind(this)
		this._openMarketDetailsModal = this._openMarketDetailsModal.bind(this)

		this._openModal = this._openModal.bind(this)
		this._closeModal = this._closeModal.bind(this)

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
				className: 'nav-cell'
			},

			{
				key: 'timestamp',
				name: 'Update',
				fieldName: 'timestamp',
				minWidth: 76,
				maxWidth: 76,
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
				className: 'nav-cell'
			},

			{
				key: 'volume_quote_btc_24h',
				name: '24h Vol BTC',
				fieldName: 'volume_quote_btc_24h',
				minWidth: 76,
				maxWidth: 76,
				isResizable: true,
				isCollapsable: true,
				data: 'string',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {
					return <span className={'nav-cell-usd'}>{utils.numFormat(item.volume_quote_btc_24h)}</span>
				},
				isPadded: false
			},

			{
				key: 'volume_quote_btc_15m',
				name: '15m Vol BTC',
				fieldName: 'volume_quote_btc_15m',
				minWidth: 76,
				maxWidth: 76,
				isResizable: true,
				isCollapsable: true,
				data: 'string',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {
					return <span className={'nav-cell-usd'}>{utils.numFormat(item.volume_quote_btc_15m)}</span>
				},
				isPadded: false
			},

			{
				key: 'volume_quote_btc_5m',
				name: '5m Vol BTC',
				fieldName: 'volume_quote_btc_5m',
				minWidth: 76,
				maxWidth: 76,
				isResizable: true,
				isCollapsable: true,
				data: 'string',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {
					return <span className={'nav-cell-usd'}>{utils.numFormat(item.volume_quote_btc_5m)}</span>
				},
				isPadded: false
			},

		]

		const _col_scanner_socket = (prop_name) => {

			let width = 66

			if (prop_name === 'timestamp') {
				width = 84
			}

			return {
				key: prop_name,
				name: prop_name,
				fieldName: prop_name,
				minWidth: width,
				maxWidth: width,
				isResizable: true,
				isCollapsable: true,
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					let val = item[prop_name]

					let display

					if (_.isNaN(val)) {
						display = _.toString(val)
					} else {
						let number = _.round(val, 2)
						display = `${number} %`
					}

					if (prop_name === 'timestamp') {
						display = formatDate(new Date(item.timestamp))
					}

					return (
						<span>{display}</span>
					)

				},
				isPadded: false,
				className: 'percentage'

			}
		}

		_.map(_columns_view, (val, key) => {

			if (val) {
				let _prop_name = _.toString(key)
				_columns.push(_col_scanner_socket(_prop_name))
			}

		})

		// Socket.io
		socket.on('all_simple_data', (data) => {

			___set_all_simple_data(data.all_simple_data)

			___set_prefs(data.prefs)

		})

		socket.on('simple_data', (data) => {

			const { ignore_list_symbols } = this.state

			_items = data.items

			for (let i = 0; i < _items.length; i++) {
				if (ignore_list_symbols.includes(_items[i].symbol)) {
					_items[i].is_ignore_list = true
				}
			}

			this.setState({

				items: _items

			})

		})

		socket.on('market_details', (data) => {

			___market_details(data)

			this.setState({
				market_details: data.market_details,
				candle_data: data.candle_data,
			})

		})

		this.state = {

			// Simple Data -->  data for main <DetailsList/> table
			items: _items,

			columns: _columns,

			market_details: null,

			candle_data: [],

			hide_ignore_list_modal: true,

			ignore_list_symbols: _ignore_list_symbols,

			auth_user: {},

			hide_watchlist_modal: true,

			all_markets: _all_markets,

			marketDetailsModalIsOpen: false,

			symbol: null,

			watchlist: _watchlist,

			watchlist_symbols: _watchlist_symbols,

			quote_state: _quote_state,

			interval: _interval,

			filters_visible: true,
			watchlist_visible: false,
			ignore_list_visible: false,

			data_updating: true,

			// Percent Change List
			percent_props: null,

			// Volume Inputs
			lower_bound: null,
			upper_bound: null,

			// Simple Data All
			items_all: _items_all,

			is_compact: false,

			// Timers
			timestamp: null,
			timestamp_all: null,

			last_update: null,
			last_update_all: null,

			my_interval: null,
			date: new Date(_.now())

		}

	}

	componentWillReceiveProps(newProps) {

		const { auth_user, market_details, candle_data } = newProps

		this.setState({
			auth_user: auth_user,
			market_details: market_details,
			candle_data: candle_data,
		})

		this._startInterval(auth_user)

	}

	componentWillUnmount () {

		clearInterval(_my_interval)

		this.setState({
			my_interval: null
		})
	}

	_startInterval (auth_user) {

		let _data = {
			auth_user: auth_user,
			component: 'SimpleList',
			method: '_startInterval'
		}

		if (_count === 0) {
			socket.emit('get_all_simple_data', _data)
			_count++
		}

		socket.emit('get_simple_data', _data)

		_my_interval = setInterval(() => {
			socket.emit('get_simple_data', _data)
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

		const { auth_user } = this.props

		if (is_checked) {
			this._startInterval(auth_user)
		} else {
			this._stopInterval()
		}
		this.setState({
			data_updating: is_checked
		})

	}

	_onSearch = (ev, text) => {

		let _text = _.toLower(text)

		let _search = _.filter(_items, (obj) => {
			const string = _.toLower(obj.pairing)
			return _text ? string.indexOf(_text) > -1 : _items
		})

		this.setState({
			items: _search
		})

	}

	_onColumnClick = (ev, column) => {
		const {columns, items} = this.state
		let newItems = items.slice()
		const newColumns = columns.slice()
		const currColumn = newColumns.filter((currCol, idx) => {
			return column.key === currCol.key
		})[0]
		newColumns.forEach((newCol) => {
			if (newCol === currColumn) {
				currColumn.isSortedDescending = !currColumn.isSortedDescending
				currColumn.isSorted = true
			} else {
				newCol.isSorted = false
				newCol.isSortedDescending = true
			}
		})
		newItems = this._sortItems(newItems, currColumn.fieldName || '', currColumn.isSortedDescending)
		this.setState({
			columns: newColumns,
			items: newItems
		})
	}

	_sortItems = (items, sortBy, descending = false) => {
		if (descending) {
			return items.sort((a, b) => {
				if (a[sortBy] < b[sortBy]) {
					return 1
				}
				if (a[sortBy] > b[sortBy]) {
					return -1
				}
				return 0
			})
		} else {
			return items.sort((a, b) => {
				if (a[sortBy] < b[sortBy]) {
					return -1
				}
				if (a[sortBy] > b[sortBy]) {
					return 1
				}
				return 0
			})
		}
	}

	_tabsHandler (update) {

		this.setState(update)

	}

	_setWatchlist (e, is_watchlist, symbol) {

		log.blue('_setWatchlist')

		const { all_markets, watchlist_symbols, items } = this.state

		if (is_watchlist) {

			_.remove(watchlist_symbols, (str) => {
				return str === symbol
			})

			_items = []
			_all_markets = []

			_items = _.map(items, (obj) => {
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
				items: _items,
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

			_items = []
			_all_markets = []

			_items = _.map(items, (obj) => {
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
				items: _items,
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

		const { all_markets, ignore_list_symbols, items } = this.state

		if (is_ignore_list) {

			_.remove(ignore_list_symbols, (str) => {
				return str === symbol
			})

			_items = []
			_all_markets = []

			_items = _.map(items, (obj) => {
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
				items: _items,
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

			_items = []

			_all_markets = []

			_items = _.map(items, (obj) => {
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
				items: _items,
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

		// console.log(this.props)

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

	render () {

		const {

			items,
			columns,

			items_all,

			market_details,
			candle_data,

			watchlist_symbols,
			ignore_list_symbols,

			is_compact,
			all_markets,

			data_updating,

		} = this.state

		const _label_search = (list) => {

			return list.length > 0 ? `Showing ${items.length} of ${items_all.length} markets.` : null

		}

		const _label_toggle = (is_checked) => {

			return is_checked ? 'Data updating every 15s' : 'Data paused...'

		}

		const spinner = () => {
			return (
				<div className={'percent-change-filer__spinner'}>
					<Spinner size={SpinnerSize.large} label={'Loading filters...'} ariaLive="assertive" labelPosition="left" />
				</div>
			)
		}

		return (
			<div className={'list-simple'}>

				<div className={'list-simple-header-controls'}>

					<Toggle label={_label_toggle(data_updating)}
							defaultChecked={true}
							className={'list-simple-toggle-data-update'}
							onChange={this._toggleDataUpdate} />

				</div>

				<section id={'table'}>

					<div className={'list-simple-header-controls-search'}>
						<Label htmlFor={'search_simple'}>{_label_search(items_all)}</Label>
					</div>

					<TextField id={'search_simple'}
							   iconProps={{iconName: 'Search'}}
							   onChange={this._onSearch}/>

					<SimpleTable items={items}
								 columns={columns}
								 compact={is_compact}
								 selectionMode={this.state.isModalSelection ? SelectionMode.multiple : SelectionMode.none}
								 setKey="set"
								 layoutMode={DetailsListLayoutMode.justified}
								 isHeaderVisible={true}
								 selectionPreservedOnEmptyClick={true}
								 enterModalSelectionOnTouch={true}
								 className={'all-markets-list'} />

				</section>

				{/* RIGHT SIDE TABS */}
				<section id={'controls'}>

					{/* ================== NAV CONTROLS ================== */}
					<div id="controls_nav_bar">
						<DocumentCard className={'card controls-nav-card'}>
							<ControlsNavBar tabsHandler={this._tabsHandler} enable_filters={this.state.interval} />
						</DocumentCard>
					</div>


					{this.state.interval ? null : spinner()}

					{/* ================== FILTERS ================== */}

					{this.state.filters_visible ? <div id={'filters'} className={'control-list-item'}>

						{/* ===== INTERVAL ===== */}
						<div id={'dateRange'}>
							{this.state.interval ? <SliderInterval defaultInterval={this.state.interval}/> : null}
						</div>

						{/* ===== VOLUME QUOTE ===== */}
						<div id={'volumeQuoteBtcChart'}>
							{this.state.lower_bound ? <VolumeCtrl lowerBound={this.state.lower_bound}
																  upperBound={this.state.upper_bound}/> : null}
						</div>

						{/* ===== PERCENT CHANGE LIST ===== */}
						<div id={'percent_change_list'}>
							{this.props.percent_props ? <PercentChangeList /> : null}
						</div>

						{/* ===== QUOTE COINS ===== */}
						<div id={'quoteChart'}>
							{this.state.quote_state ? <QuoteCtrl quoteState={this.state.quote_state} itemsAll={this.state.items_all}/> : null}

						</div>
					</div> : null}

					{/* ================== WATCHLIST ================== */}
					{this.state.watchlist_visible ? <div id={'watchlist'} className={'control-list-item'}>
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
																	   _modalHandler={this._modalHandler}/> : null}

						</DocumentCard>
					</div> : null}

					{/* ================== IGNORE LIST ================== */}
					{this.state.ignore_list_visible ? <div id={'ignore_list'} className={'control-list-item'}>

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
																		  _modalHandler={this._modalHandler}/> : null}

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
								 all_markets={_all_markets}
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
								all_markets={_all_markets}
								_closeModal={(e) => {this._closeModal(e, 'watchlist_modal')}}
								_modalListHandler={this._modalListHandler}
								_modalHandler={this._modalHandler} />


				{/* MARKET DETAILS MODAL */}
				{market_details ? <MarketDetailsModal id={'market_details_modal'}
													  is_open={this.state.marketDetailsModalIsOpen}
													  candle_data={candle_data}
													  market_details={market_details}
													  _onRequestClose={this._closeMarketDetailsModal}/> : null}

			</div>
		)

	}

}

function mapStateToProps (state) {
	return {
		auth_user: state.allSimpleData.auth_user,
		percent_props: state.allSimpleData.percent_props,
	}
}

export default connect(
	mapStateToProps
)(SimpleList)