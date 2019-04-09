import React from 'react'

import { connect } from 'react-redux'

import * as utils from '../../util/utils'

import { _log, log } from '../../util/utils'

import { socket } from '../../redux/modules/socket_actions'

import _ from 'lodash'

import { mobileBreakpoint } from '../../constants/ui-constants'

import { DocumentCard } from 'office-ui-fabric-react/lib/DocumentCard'

import { ActionButton } from 'office-ui-fabric-react/lib/Button'

import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner'

import ControlsNavBar from './ControlsNavBar'

import { WatchList } from './WatchList'

import { IgnoreList } from './IgnoreList'

import SliderInterval from './SliderInterval'

import PercentChangeList from './PercentChangeList'

import VolumeCtrl from './VolumeCtrl'

import {
	WatchlistModal,
	MarketDetailsModal
} from '../modal/Modals'

import {
	IgnoreListModal
} from '../modal/ModalsIgnoreList'

import FixedList from './FixedList'

import {

	___set_all_simple_data,

	___market_details,

	___set_prefs,

} from '../../index'

import { initializeIcons } from '@uifabric/icons'

initializeIcons()

let _items = []

let _my_interval

let _all_markets = []

let _watchlist_symbols = []

let _ignore_list_symbols = []

let _count = 0

let _is_2x_obo = 2

let _is_2x = 2

class SimpleList extends React.Component {
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
		this._onChangeHandler = this._onChangeHandler.bind(this)
		this._onSelectObo2x = this._onSelectObo2x.bind(this)

		// Modals
		this._closeMarketDetailsModal = this._closeMarketDetailsModal.bind(this)
		this._openMarketDetailsModal = this._openMarketDetailsModal.bind(this)
		this._openModal = this._openModal.bind(this)
		this._closeModal = this._closeModal.bind(this)

		// On Data
		this._onAllSimpleData = this._onAllSimpleData.bind(this)
		this._onSimpleData = this._onSimpleData.bind(this)

		let is_mobile = window.innerWidth <= mobileBreakpoint

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

		socket.on('simple_data', (data) => {

			___set_prefs(data.prefs)

			this._onSimpleData(data)

		})

		let items = this.props.items

		let watchlist_symbols = this.props.watchlist_symbols

		let ignore_list_symbols = this.props.ignore_list_symbols

		for (let i = 0; i < items.length; i++) {

			if (watchlist_symbols.includes(items[i].symbol)) {
				items[i].is_watchlist = true
			}
			else {
				items[i].is_watchlist = false
			}

			if (ignore_list_symbols.includes(items[i].symbol)) {
				items[i].is_ignore_list = true
			}
			else {
				items[i].is_ignore_list = false
			}

		}

		this.state = {

			is_mobile: is_mobile,

			is_browser: !is_mobile,

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
			items: this.props.items,

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

	_onSimpleData (data) {

		let items = data.items

		let prefs = data.prefs

		let is_2x = prefs._is_2x

		let is_2x_obo = prefs._is_2x_obo

		let interval = prefs._interval

		let lower_bound = prefs._lower_bound

		let upper_bound = prefs._upper_bound

		let percent_props = prefs._percent_props

		let quote_state = prefs._quote_state

		let watchlist_symbols = prefs._watchlist_symbols

		let ignore_list_symbols = prefs._ignore_list_symbols

		for (let i = 0; i < items.length; i++) {

			if (ignore_list_symbols.includes(items[i].symbol)) {
				items[i].is_ignore_list = true
			}
			else {
				items[i].is_ignore_list = false
			}

			if (watchlist_symbols.includes(items[i].symbol)) {
				items[i].is_watchlist = true
			}
			else {
				items[i].is_watchlist = false
			}

		}

		let update = {

			items,

			prefs,

			is_2x,

			is_2x_obo,

			interval,

			lower_bound,

			upper_bound,

			percent_props,

			quote_state,

			watchlist_symbols,

			ignore_list_symbols,

		}

		this.setState(update)

	}

	_startInterval (auth_user) {

		let _data = {
			auth_user: auth_user,
			component: 'SimpleList',
			method: '_startInterval',
		}

		if (_count === 0) {
			socket.emit('get_all_simple_data', _data)
			socket.emit('get_simple_data', _data)
			_count++
		}

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
				items: _.filter(_items, (obj) => {
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
				items: _.filter(_items, (obj) => {
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

		const { is_browser } = this.state

		if (is_browser) {

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

	}

	_closeMarketDetailsModal () {

		this.setState({
			marketDetailsModalIsOpen: false,
			symbol: null
		})

	}

	_openMarketDetailsModal (e, details) {

		const { is_browser } = this.state

		if (is_browser) {

			details.interval = this.state.interval

			socket.emit('get_market_details', details)

			this.setState({
				market_details: details,
				marketDetailsModalIsOpen: true,
				symbol: details.symbol,
			})

		}

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

		_is_2x_obo = +item.key

		this.setState({
			is_2x_obo: _is_2x_obo,
		})

	}

	_onChangeHandler (e, item) {

		_is_2x = +item.key

		this.setState({
			is_2x: _is_2x,
		})

	}

	render () {

		const {

			items,

			all_markets,

			watchlist_symbols,

			ignore_list_symbols,

			is_2x,

			is_2x_obo,

			market_details,

			candle_data,

			percent_props,

			interval,

			lower_bound,

			upper_bound,

			quote_state,

			filters_visible,

			watchlist_visible,

			is_mobile,

			is_browser

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

				{is_mobile ? <div>IS MOBILE</div> : null}


				{/* ================== Simple DATA TABLE ================== */}

				{is_browser ? <section id={'table'}>

								{items.length > 0 ? <FixedList id={'simple_list'}
															   items={items}
															   all_markets={all_markets}
															   watchlist_symbols={watchlist_symbols}
															   ignore_list_symbols={ignore_list_symbols}
															   is_2x={is_2x}
															   is_2x_obo={is_2x_obo}
															   _setWatchlist={this._setWatchlist}
															   _setIgnoreList={this._setIgnoreList}
															   _openMarketDetailsModal={this._openMarketDetailsModal} /> : null
								}

							</section> : null
				}



				{/* ================== NAV CONTROLS ================== */}

				{is_browser ? <section id={'controls'}>

									<div id="controls_nav_bar">

										<DocumentCard className={'card controls-nav-card'}>

											<ControlsNavBar _tabsHandler={this._tabsHandler} enable_filters={interval} />

										</DocumentCard>

									</div>


									{/* ================== FILTERS ================== */}

									{interval ? null : spinner()}

									{filters_visible ? <div id={'filters'} className={'control-list-item'}>

															<div id={'dateRange'}>
																{interval ? <SliderInterval defaultInterval={interval}/> : null}
															</div>

															<div id={'volumeQuoteBtcChart'}>
																{upper_bound > 0 ? <VolumeCtrl lower_bound={lower_bound} upper_bound={upper_bound} /> : null}
															</div>

															<div id={'percent_change_list'}>
																{percent_props ? <PercentChangeList /> : null}
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

														</div> : null
									}



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
																														  _modalHandler={this._modalHandler} /> : null
																			}

																		</DocumentCard>

																	</div> : null
									}

						  	 </section> : null
				}



				{/* ================== MODALS ================== */}

				{is_browser ? <IgnoreListModal id={'ignore_list_modal'}
											   container_class={'watchlist-modal-wrapper'}
											   title={'Ignore List'}
											   sub_text={'Add or remove markets from your ignore list'}
											   hide_dialog={this.state.hide_ignore_list_modal}
											   ignore_list_symbols={ignore_list_symbols}
											   all_markets={all_markets}
											   _closeModal={(e) => {this._closeModal(e, 'ignore_list_modal')}}
											   _modalListHandlerIgnore={this._modalListHandlerIgnore}
											   _modalHandler={this._modalHandler} /> : null
				}

				{is_browser ? <WatchlistModal id={'watchlist_modal'}
											  container_class={'watchlist-modal-wrapper'}
											  title={'Watchlist'}
											  sub_text={'Add or remove markets from your watchlist'}
											  hide_dialog={this.state.hide_watchlist_modal}
											  watchlist_symbols={watchlist_symbols}
											  all_markets={all_markets}
											  _closeModal={(e) => {this._closeModal(e, 'watchlist_modal')}}
											  _modalListHandler={this._modalListHandler}
											  _modalHandler={this._modalHandler} /> : null
				}


				{is_browser && market_details ? <MarketDetailsModal id={'market_details_modal'}
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
)(SimpleList)