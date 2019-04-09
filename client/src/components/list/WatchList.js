import * as React from 'react'

import * as utils from '../../util/utils'

import { _log, log } from '../../util/utils'

import { socket } from '../../redux/modules/socket_actions'

import _ from 'lodash'

import { Link } from 'office-ui-fabric-react/lib/Link'

import { DetailsList, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList'

import { TextField } from 'office-ui-fabric-react/lib/TextField'

import { Icon } from 'office-ui-fabric-react/lib/Icon'

import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip'

import { Chance } from 'chance'

const chance = new Chance()

const timeFormat = require('d3-time-format').timeFormat
const format_string = '%b %e,%_I:%M %p'
const formatDate = timeFormat(format_string)

let _items = []

let _columns = []

let _all_markets = []

class WatchList extends React.Component {

	constructor (props) {
		super(props)

		this._renderItemColumn = this._renderItemColumn.bind(this)
		this._openModal = this._openModal.bind(this)
		this._closeModal = this._closeModal.bind(this)
		this._modalHandler = this._modalHandler.bind(this)

		this._setWatchlist = this._setWatchlist.bind(this)
		this._setIgnoreList = this._setIgnoreList.bind(this)

		const {all_markets, watchlist_symbols, list_id} = this.props

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
							<Link onClick={(e) => this._openModal(e, details)}>{details.symbol}</Link>
						</div>
					)
				},
				isPadded: false,
				className: 'nav-cell'
			},

			{
				key: 'close',
				name: 'Last',
				fieldName: 'close',
				minWidth: 56,
				maxWidth: 56,
				isResizable: true,
				isCollapsable: true,
				data: 'string',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {
					return <span className={'nav-cell-usd'}>{utils.numFormat(item.close)}</span>
				},
				isPadded: false
			},

			{
				key: 'volume_quote_btc_24h',
				name: '24h Vol BTC',
				fieldName: 'volume_quote_btc_24h',
				minWidth: 56,
				maxWidth: 56,
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
				minWidth: 56,
				maxWidth: 56,
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
				minWidth: 56,
				maxWidth: 56,
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

		_items = []

		_.each(all_markets, (obj) => {
			if (watchlist_symbols.includes(obj.symbol)) {
				obj.is_watchlist = true
				_items.push(obj)
			}
		})

		console.log(_items[0].volume_quote_btc_24h)

		this.state = {

			columns: _columns,
			items: _items,

			watchlist_symbols: watchlist_symbols,
			all_markets: all_markets,
		}

	}

	componentWillReceiveProps (nextProps) {

		const {all_markets, watchlist_symbols, list_id} = nextProps

		// log.green(nextProps)

		_items = []
		_.each(all_markets, (obj) => {
			if (watchlist_symbols.includes(obj.symbol)) {
				obj.is_watchlist = true
				_items.push(obj)
			}
		})

		let update_state = {
			items: _items,
			watchlist_symbols: watchlist_symbols,
			all_markets: all_markets
		}

		this.setState(update_state)

	}

	_onColumnClick = (event, column) => {

		let { columns, items } = this.state

		let isSortedDescending = column.isSortedDescending

		// If we've sorted this column, flip it.
		if (column.isSorted) {
			isSortedDescending = !isSortedDescending
		}

		// Sort the items.
		items = items.concat([]).sort((a, b) => {
			const firstValue = a[column.fieldName || '']
			const secondValue = b[column.fieldName || '']

			if (isSortedDescending) {
				return firstValue > secondValue ? -1 : 1
			} else {
				return firstValue > secondValue ? 1 : -1
			}
		})

		// Reset the items and columns to match the state.
		this.setState({
			items: items,
			columns: columns.map(col => {
				col.isSorted = col.key === column.key

				if (col.isSorted) {
					col.isSortedDescending = isSortedDescending
				}

				return col
			})
		})

	}

	_closeModal (e, item) {

		const _data = {action: 'close_modal_market_details', item: item}
		this.props._modalHandler(_data)

	}

	_openModal (e, item) {

		this.props._modalHandler(e, item)

	}

	_renderItemColumn (item, index, column) {

		const fieldContent = item[column.fieldName || '']

		switch (column.key) {
			case 'symbol':
				return <Link onClick={(e) => this._modalHandler(e, item)}>{item.symbol}</Link>
			default:
				return <span key={chance.guid()}>{fieldContent}</span>
		}
	}

	_setWatchlist (e, is_watchlist, symbol) {
		this.props._setWatchlist(e, is_watchlist, symbol)
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

	_onSearch = (e, text) => {

		// log.yellow(text)

		let _text = _.toLower(text)

		let _search = _.filter(_items, (obj) => {
			const string = _.toLower(obj.pairing)
			return _text ? string.indexOf(_text) > -1 : _items
		})

		this.setState({
			items: _search
		})

	}

	_modalHandler (e, data) {
		return this.props._modalHandler(e, data)
	}

	render () {

		const { columns, items } = this.state

		return (
			<section>

				<TextField id={'watchlist_search'}
						   label={this.props.title}
						   iconProps={{iconName: 'Search'}}
						   onChange={this._onSearch}/>

				<DetailsList id={'watchlist_list'}
							 columns={columns}
							 items={items}
							 setKey="set"
							 onRenderItemColumn={this._renderItemColumn}
							 selectionMode={SelectionMode.none}/>

			</section>
		)
	}

}

export { WatchList }